import {
  users,
  companies,
  jobs,
  applications,
  savedJobs,
  jobAlerts,
  resumes,
  externalJobSources,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type SavedJob,
  type InsertSavedJob,
  type JobAlert,
  type InsertJobAlert,
  type Resume,
  type InsertResume,
  type ExternalJobSource,
  type InsertExternalJobSource,
  type JobWithCompany,
  type ApplicationWithJob,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Company operations
  createCompany(company: InsertCompany): Promise<Company>;
  getCompanies(): Promise<Company[]>;

  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJobs(filters?: {
    location?: string;
    type?: string;
    salaryMin?: number;
    keywords?: string;
    limit?: number;
    offset?: number;
  }): Promise<JobWithCompany[]>;
  getJobById(id: number): Promise<JobWithCompany | undefined>;
  getJobsForUser(userId: string, filters?: any): Promise<JobWithCompany[]>;

  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getUserApplications(userId: string): Promise<ApplicationWithJob[]>;
  getApplicationByUserAndJob(userId: string, jobId: number): Promise<Application | undefined>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;

  // Saved jobs operations
  saveJob(savedJob: InsertSavedJob): Promise<SavedJob>;
  unsaveJob(userId: string, jobId: number): Promise<void>;
  getUserSavedJobs(userId: string): Promise<JobWithCompany[]>;
  isJobSaved(userId: string, jobId: number): Promise<boolean>;

  // Job alerts operations
  createJobAlert(alert: InsertJobAlert): Promise<JobAlert>;
  getUserJobAlerts(userId: string): Promise<JobAlert[]>;
  deleteJobAlert(id: number): Promise<void>;

  // Dashboard operations
  getUserStats(userId: string): Promise<{
    applications: number;
    savedJobs: number;
    pending: number;
    interviews: number;
  }>;
  getRecentActivity(userId: string): Promise<any[]>;

  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getUserResumes(userId: string): Promise<Resume[]>;
  getResumeById(id: number): Promise<Resume | undefined>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<void>;
  setDefaultResume(userId: string, resumeId: number): Promise<void>;

  // Stepstone integration
  syncStepstoneJobs(location?: string, keywords?: string): Promise<Job[]>;
  createExternalJobSource(source: InsertExternalJobSource): Promise<ExternalJobSource>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values([job]).returning();
    return newJob;
  }

  async getJobs(filters?: {
    location?: string;
    type?: string;
    salaryMin?: number;
    keywords?: string;
    limit?: number;
    offset?: number;
  }): Promise<JobWithCompany[]> {
    try {
      const baseQuery = db
        .select()
        .from(jobs)
        .leftJoin(companies, eq(jobs.companyId, companies.id))
        .where(eq(jobs.isActive, true));

      let whereConditions = [eq(jobs.isActive, true)];

      if (filters) {
        if (filters.location && filters.location !== "All Locations") {
          whereConditions.push(ilike(jobs.location, `%${filters.location}%`));
        }

        if (filters.type && filters.type !== "all") {
          whereConditions.push(eq(jobs.type, filters.type));
        }

        if (filters.salaryMin) {
          whereConditions.push(gte(jobs.salaryMin, filters.salaryMin.toString()));
        }

        if (filters.keywords) {
          const keywordCondition = or(
            ilike(jobs.title, `%${filters.keywords}%`),
            ilike(jobs.description, `%${filters.keywords}%`)
          );
          if (keywordCondition) {
            whereConditions.push(keywordCondition);
          }
        }
      }

      const result = await db
        .select()
        .from(jobs)
        .leftJoin(companies, eq(jobs.companyId, companies.id))
        .where(and(...whereConditions))
        .orderBy(desc(jobs.postedAt))
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0);

      return result.map((row: any) => ({
        id: row.jobs.id,
        title: row.jobs.title,
        description: row.jobs.description,
        companyId: row.jobs.companyId,
        location: row.jobs.location,
        type: row.jobs.type,
        salaryMin: row.jobs.salaryMin,
        salaryMax: row.jobs.salaryMax,
        skills: row.jobs.skills,
        requirements: row.jobs.requirements,
        isActive: row.jobs.isActive,
        postedAt: row.jobs.postedAt,
        createdAt: row.jobs.createdAt,
        company: row.companies ? {
          id: row.companies.id,
          name: row.companies.name,
          description: row.companies.description,
          website: row.companies.website,
          logo: row.companies.logo,
          location: row.companies.location,
          createdAt: row.companies.createdAt,
        } : null,
      })) as JobWithCompany[];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }

  async getJobById(id: number): Promise<JobWithCompany | undefined> {
    const [result] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        companyId: jobs.companyId,
        location: jobs.location,
        type: jobs.type,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        skills: jobs.skills,
        requirements: jobs.requirements,
        isActive: jobs.isActive,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        company: {
          id: companies.id,
          name: companies.name,
          description: companies.description,
          website: companies.website,
          logo: companies.logo,
          location: companies.location,
          createdAt: companies.createdAt,
        },
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.id, id));

    if (!result) return undefined;

    return {
      ...result,
      company: result.company?.id ? result.company : null,
    } as JobWithCompany;
  }

  async getJobsForUser(userId: string, filters?: any): Promise<JobWithCompany[]> {
    const jobsList = await this.getJobs(filters);
    
    // Get user's saved jobs and applications
    const userSavedJobs = await db
      .select({ jobId: savedJobs.jobId })
      .from(savedJobs)
      .where(eq(savedJobs.userId, userId));

    const userApplications = await db
      .select({ jobId: applications.jobId })
      .from(applications)
      .where(eq(applications.userId, userId));

    const savedJobIds = new Set(userSavedJobs.map(sj => sj.jobId));
    const appliedJobIds = new Set(userApplications.map(app => app.jobId));

    return jobsList.map(job => ({
      ...job,
      isSaved: savedJobIds.has(job.id),
      hasApplied: appliedJobIds.has(job.id),
    }));
  }

  // Application operations
  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async getUserApplications(userId: string): Promise<ApplicationWithJob[]> {
    const result = await db
      .select({
        id: applications.id,
        userId: applications.userId,
        jobId: applications.jobId,
        status: applications.status,
        coverLetter: applications.coverLetter,
        resume: applications.resume,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          companyId: jobs.companyId,
          location: jobs.location,
          type: jobs.type,
          salaryMin: jobs.salaryMin,
          salaryMax: jobs.salaryMax,
          skills: jobs.skills,
          requirements: jobs.requirements,
          isActive: jobs.isActive,
          postedAt: jobs.postedAt,
          createdAt: jobs.createdAt,
          company: {
            id: companies.id,
            name: companies.name,
            description: companies.description,
            website: companies.website,
            logo: companies.logo,
            location: companies.location,
            createdAt: companies.createdAt,
          },
        },
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.appliedAt));

    return result.map((row: any) => ({
      ...row,
      job: {
        ...row.job,
        company: row.job.company?.id ? row.job.company : null,
      },
    })) as ApplicationWithJob[];
  }

  async getApplicationByUserAndJob(userId: string, jobId: number): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.jobId, jobId)));
    return application;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  // Saved jobs operations
  async saveJob(savedJob: InsertSavedJob): Promise<SavedJob> {
    const [newSavedJob] = await db.insert(savedJobs).values(savedJob).returning();
    return newSavedJob;
  }

  async unsaveJob(userId: string, jobId: number): Promise<void> {
    await db
      .delete(savedJobs)
      .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
  }

  async getUserSavedJobs(userId: string): Promise<JobWithCompany[]> {
    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        companyId: jobs.companyId,
        location: jobs.location,
        type: jobs.type,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        skills: jobs.skills,
        requirements: jobs.requirements,
        isActive: jobs.isActive,
        postedAt: jobs.postedAt,
        createdAt: jobs.createdAt,
        company: {
          id: companies.id,
          name: companies.name,
          description: companies.description,
          website: companies.website,
          logo: companies.logo,
          location: companies.location,
          createdAt: companies.createdAt,
        },
      })
      .from(savedJobs)
      .leftJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(savedJobs.userId, userId))
      .orderBy(desc(savedJobs.savedAt));

    return result.map((row) => ({
      ...row,
      company: row.company?.id ? row.company : null,
      isSaved: true,
    })) as JobWithCompany[];
  }

  async isJobSaved(userId: string, jobId: number): Promise<boolean> {
    const [savedJob] = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
    return !!savedJob;
  }

  // Job alerts operations
  async createJobAlert(alert: InsertJobAlert): Promise<JobAlert> {
    const [newAlert] = await db.insert(jobAlerts).values(alert).returning();
    return newAlert;
  }

  async getUserJobAlerts(userId: string): Promise<JobAlert[]> {
    return await db.select().from(jobAlerts).where(eq(jobAlerts.userId, userId));
  }

  async deleteJobAlert(id: number): Promise<void> {
    await db.delete(jobAlerts).where(eq(jobAlerts.id, id));
  }

  // Dashboard operations
  async getUserStats(userId: string): Promise<{
    applications: number;
    savedJobs: number;
    pending: number;
    interviews: number;
  }> {
    const [applicationsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.userId, userId));

    const [savedJobsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(savedJobs)
      .where(eq(savedJobs.userId, userId));

    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(
        and(
          eq(applications.userId, userId),
          inArray(applications.status, ["pending", "reviewed"])
        )
      );

    const [interviewsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(
        and(eq(applications.userId, userId), eq(applications.status, "interview"))
      );

    return {
      applications: applicationsCount.count,
      savedJobs: savedJobsCount.count,
      pending: pendingCount.count,
      interviews: interviewsCount.count,
    };
  }

  async getRecentActivity(userId: string): Promise<any[]> {
    const recentApplications = await db
      .select({
        type: sql<string>`'application'`,
        id: applications.id,
        jobTitle: jobs.title,
        companyName: companies.name,
        status: applications.status,
        timestamp: applications.appliedAt,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.appliedAt))
      .limit(5);

    const recentSaves = await db
      .select({
        type: sql<string>`'save'`,
        id: savedJobs.id,
        jobTitle: jobs.title,
        companyName: companies.name,
        status: sql<string>`null`,
        timestamp: savedJobs.savedAt,
      })
      .from(savedJobs)
      .leftJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(savedJobs.userId, userId))
      .orderBy(desc(savedJobs.savedAt))
      .limit(5);

    const allActivities = [...recentApplications, ...recentSaves];
    return allActivities
      .sort((a, b) => {
        const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timestampB - timestampA;
      })
      .slice(0, 10);
  }

  // Resume operations
  async createResume(resume: InsertResume): Promise<Resume> {
    // If this is set as default, unset other defaults for this user
    if (resume.isDefault) {
      await db
        .update(resumes)
        .set({ isDefault: false })
        .where(eq(resumes.userId, resume.userId));
    }

    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.updatedAt));
  }

  async getResumeById(id: number): Promise<Resume | undefined> {
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id));
    return resume;
  }

  async updateResume(id: number, resumeData: Partial<InsertResume>): Promise<Resume | undefined> {
    // If this is set as default, unset other defaults for this user
    if (resumeData.isDefault && resumeData.userId) {
      await db
        .update(resumes)
        .set({ isDefault: false })
        .where(eq(resumes.userId, resumeData.userId));
    }

    const [updatedResume] = await db
      .update(resumes)
      .set({ ...resumeData, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return updatedResume;
  }

  async deleteResume(id: number): Promise<void> {
    await db.delete(resumes).where(eq(resumes.id, id));
  }

  async setDefaultResume(userId: string, resumeId: number): Promise<void> {
    // Unset all defaults for this user
    await db
      .update(resumes)
      .set({ isDefault: false })
      .where(eq(resumes.userId, userId));

    // Set the specified resume as default
    await db
      .update(resumes)
      .set({ isDefault: true })
      .where(eq(resumes.id, resumeId));
  }

  // Stepstone integration
  async syncStepstoneJobs(location?: string, keywords?: string): Promise<Job[]> {
    try {
      // Mock Stepstone API call - in real implementation, you'd call the actual API
      const mockStepstoneJobs = [
        {
          title: "Senior Software Engineer",
          description: "Join our growing team as a Senior Software Engineer. We're looking for someone with 5+ years of experience in full-stack development.",
          location: location || "Remote",
          type: "full-time",
          salaryMin: "80000",
          salaryMax: "120000",
          skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
          requirements: "5+ years of experience in software development",
          companyId: null, // Will be created or found
        },
        {
          title: "Product Manager",
          description: "Lead product development and strategy for our innovative platform. Experience with agile methodologies required.",
          location: location || "Berlin, Germany",
          type: "full-time",
          salaryMin: "70000",
          salaryMax: "95000",
          skills: ["Product Management", "Agile", "Analytics", "UX Design"],
          requirements: "3+ years of product management experience",
          companyId: null,
        },
        {
          title: "UX Designer",
          description: "Create beautiful and intuitive user experiences. Work closely with development and product teams.",
          location: location || "Munich, Germany",
          type: "full-time",
          salaryMin: "60000",
          salaryMax: "85000",
          skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
          requirements: "2+ years of UX design experience",
          companyId: null,
        }
      ];

      const createdJobs: Job[] = [];

      for (const jobData of mockStepstoneJobs) {
        // Filter by keywords if provided
        if (keywords && !jobData.title.toLowerCase().includes(keywords.toLowerCase()) && 
            !jobData.description.toLowerCase().includes(keywords.toLowerCase())) {
          continue;
        }

        // Create or find company
        let company = await db
          .select()
          .from(companies)
          .where(eq(companies.name, "Stepstone Partner Company"))
          .limit(1);

        if (company.length === 0) {
          const [newCompany] = await db
            .insert(companies)
            .values({
              name: "Stepstone Partner Company",
              description: "A leading technology company sourced from Stepstone",
              website: "https://stepstone.com",
              location: jobData.location,
            })
            .returning();
          company = [newCompany];
        }

        // Create job
        const [newJob] = await db
          .insert(jobs)
          .values({
            ...jobData,
            companyId: company[0].id,
          })
          .returning();

        createdJobs.push(newJob);

        // Create external job source tracking
        await db.insert(externalJobSources).values({
          source: "stepstone",
          externalId: `stepstone_${Date.now()}_${Math.random()}`,
          jobId: newJob.id,
          data: { originalData: jobData },
        });
      }

      return createdJobs;
    } catch (error) {
      console.error("Error syncing Stepstone jobs:", error);
      return [];
    }
  }

  async createExternalJobSource(source: InsertExternalJobSource): Promise<ExternalJobSource> {
    const [newSource] = await db.insert(externalJobSources).values(source).returning();
    return newSource;
  }
}

export const storage = new DatabaseStorage();
