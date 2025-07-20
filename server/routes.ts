import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertJobSchema,
  insertApplicationSchema,
  insertSavedJobSchema,
  insertJobAlertSchema,
  insertCompanySchema,
  insertResumeSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activity = await storage.getRecentActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Job routes
  app.get("/api/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { location, type, salaryMin, keywords, limit, offset } = req.query;
      
      const filters = {
        location: location as string,
        type: type as string,
        salaryMin: salaryMin ? parseInt(salaryMin as string) : undefined,
        keywords: keywords as string,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
      };

      const jobs = await storage.getJobsForUser(userId, filters);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(400).json({ message: "Failed to create job" });
    }
  });

  // Application routes
  app.get("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        userId,
      });

      // Check if user already applied to this job
      const existingApplication = await storage.getApplicationByUserAndJob(
        userId,
        validatedData.jobId
      );

      if (existingApplication) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }

      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(400).json({ message: "Failed to create application" });
    }
  });

  app.patch("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;

      const application = await storage.updateApplicationStatus(applicationId, status);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Saved jobs routes
  app.get("/api/saved-jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedJobs = await storage.getUserSavedJobs(userId);
      res.json(savedJobs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      res.status(500).json({ message: "Failed to fetch saved jobs" });
    }
  });

  app.post("/api/saved-jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSavedJobSchema.parse({
        ...req.body,
        userId,
      });

      // Check if job is already saved
      const isAlreadySaved = await storage.isJobSaved(userId, validatedData.jobId);
      
      if (isAlreadySaved) {
        return res.status(400).json({ message: "Job is already saved" });
      }

      const savedJob = await storage.saveJob(validatedData);
      res.status(201).json(savedJob);
    } catch (error) {
      console.error("Error saving job:", error);
      res.status(400).json({ message: "Failed to save job" });
    }
  });

  app.delete("/api/saved-jobs/:jobId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobId = parseInt(req.params.jobId);

      await storage.unsaveJob(userId, jobId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unsaving job:", error);
      res.status(500).json({ message: "Failed to unsave job" });
    }
  });

  // Job alerts routes
  app.get("/api/job-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await storage.getUserJobAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching job alerts:", error);
      res.status(500).json({ message: "Failed to fetch job alerts" });
    }
  });

  app.post("/api/job-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertJobAlertSchema.parse({
        ...req.body,
        userId,
      });

      const alert = await storage.createJobAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating job alert:", error);
      res.status(400).json({ message: "Failed to create job alert" });
    }
  });

  app.delete("/api/job-alerts/:id", isAuthenticated, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      await storage.deleteJobAlert(alertId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job alert:", error);
      res.status(500).json({ message: "Failed to delete job alert" });
    }
  });

  // Company routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ message: "Failed to create company" });
    }
  });

  // Resume routes
  app.post("/api/resumes", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const resumeData = insertResumeSchema.parse({
        ...req.body,
        userId,
      });
      
      const resume = await storage.createResume(resumeData);
      res.json(resume);
    } catch (error) {
      console.error("Error creating resume:", error);
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  app.get("/api/resumes", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const resumes = await storage.getUserResumes(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get("/api/resumes/:id", isAuthenticated, async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const resume = await storage.getResumeById(resumeId);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.put("/api/resumes/:id", isAuthenticated, async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;
      
      const resumeData = { ...req.body, userId };
      const updatedResume = await storage.updateResume(resumeId, resumeData);
      
      if (!updatedResume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      res.json(updatedResume);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  app.delete("/api/resumes/:id", isAuthenticated, async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      await storage.deleteResume(resumeId);
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  app.put("/api/resumes/:id/default", isAuthenticated, async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;
      
      await storage.setDefaultResume(userId, resumeId);
      res.json({ message: "Default resume updated successfully" });
    } catch (error) {
      console.error("Error setting default resume:", error);
      res.status(500).json({ message: "Failed to set default resume" });
    }
  });

  // Stepstone integration routes
  app.post("/api/stepstone/sync", isAuthenticated, async (req, res) => {
    try {
      const { location, keywords } = req.body;
      const jobs = await storage.syncStepstoneJobs(location, keywords);
      res.json({ 
        message: `Successfully synced ${jobs.length} jobs from Stepstone`,
        jobs 
      });
    } catch (error) {
      console.error("Error syncing Stepstone jobs:", error);
      res.status(500).json({ message: "Failed to sync Stepstone jobs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
