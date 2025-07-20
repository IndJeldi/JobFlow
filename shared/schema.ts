import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  logo: varchar("logo", { length: 255 }),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  companyId: integer("company_id").references(() => companies.id),
  location: varchar("location", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(), // full-time, part-time, contract, internship
  salaryMin: decimal("salary_min"),
  salaryMax: decimal("salary_max"),
  skills: jsonb("skills").$type<string[]>().default([]),
  requirements: text("requirements"),
  isActive: boolean("is_active").default(true),
  postedAt: timestamp("posted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, reviewed, interview, rejected, accepted
  coverLetter: text("cover_letter"),
  resume: varchar("resume", { length: 255 }),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved jobs table
export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Job alerts table
export const jobAlerts = pgTable("job_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  keywords: varchar("keywords", { length: 255 }),
  location: varchar("location", { length: 255 }),
  type: varchar("type", { length: 50 }),
  salaryMin: decimal("salary_min"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resume table
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  personalInfo: jsonb("personal_info").$type<{
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    website?: string;
    summary?: string;
  }>(),
  experience: jsonb("experience").$type<Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    location?: string;
  }>>().default([]),
  education: jsonb("education").$type<Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
  }>>().default([]),
  skills: jsonb("skills").$type<string[]>().default([]),
  projects: jsonb("projects").$type<Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate: string;
    endDate?: string;
  }>>().default([]),
  certifications: jsonb("certifications").$type<Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
  }>>().default([]),
  template: varchar("template", { length: 50 }).default("modern"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// External job sources table for Stepstone integration
export const externalJobSources = pgTable("external_job_sources", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 50 }).notNull(), // 'stepstone', 'indeed', etc.
  externalId: varchar("external_id", { length: 255 }).notNull(),
  jobId: integer("job_id").references(() => jobs.id),
  lastSynced: timestamp("last_synced").defaultNow(),
  data: jsonb("data"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  savedJobs: many(savedJobs),
  jobAlerts: many(jobAlerts),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
  savedJobs: many(savedJobs),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(users, {
    fields: [savedJobs.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [savedJobs.jobId],
    references: [jobs.id],
  }),
}));

export const jobAlertsRelations = relations(jobAlerts, ({ one }) => ({
  user: one(users, {
    fields: [jobAlerts.userId],
    references: [users.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

export const externalJobSourcesRelations = relations(externalJobSources, ({ one }) => ({
  job: one(jobs, {
    fields: [externalJobSources.jobId],
    references: [jobs.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedAt: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

export const insertSavedJobSchema = createInsertSchema(savedJobs).omit({
  id: true,
  savedAt: true,
});

export const insertJobAlertSchema = createInsertSchema(jobAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExternalJobSourceSchema = createInsertSchema(externalJobSources).omit({
  id: true,
  lastSynced: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
export type JobAlert = typeof jobAlerts.$inferSelect;
export type InsertJobAlert = z.infer<typeof insertJobAlertSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type ExternalJobSource = typeof externalJobSources.$inferSelect;
export type InsertExternalJobSource = z.infer<typeof insertExternalJobSourceSchema>;

// Extended types for API responses
export type JobWithCompany = Job & {
  company: Company | null;
  isSaved?: boolean;
  hasApplied?: boolean;
};

export type ApplicationWithJob = Application & {
  job: JobWithCompany;
};
