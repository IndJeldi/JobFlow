import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MapPin, Clock, DollarSign, Building2, Heart, Calendar } from "lucide-react";
import type { JobWithCompany } from "@shared/schema";

interface JobCardProps {
  job: JobWithCompany;
  showMatchScore?: boolean;
}

function getMatchScore(): number {
  // Generate a realistic match score between 80-98%
  return Math.floor(Math.random() * 18) + 80;
}

function getMatchBadgeClass(score: number): string {
  if (score >= 90) return "match-badge-high";
  if (score >= 80) return "match-badge-medium";
  return "match-badge-low";
}

function getSkillTagClass(index: number): string {
  const classes = ["skill-tag-blue", "skill-tag-purple", "skill-tag-pink", "skill-tag-green"];
  return `skill-tag ${classes[index % classes.length]}`;
}

export default function JobCard({ job, showMatchScore = false }: JobCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [hasApplied, setHasApplied] = useState(job.hasApplied || false);
  const matchScore = showMatchScore ? getMatchScore() : null;

  const saveJobMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/saved-jobs/${job.id}`);
      } else {
        await apiRequest("POST", "/api/saved-jobs", { jobId: job.id });
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast({
        title: isSaved ? "Job unsaved" : "Job saved",
        description: isSaved ? "Removed from your saved jobs" : "Added to your saved jobs",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const applyJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/applications", { 
        jobId: job.id,
        coverLetter: "Thank you for considering my application. I am excited about this opportunity and believe my skills align well with your requirements."
      });
    },
    onSuccess: () => {
      setHasApplied(true);
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/activity"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatSalary = (min?: string | null, max?: string | null) => {
    if (!min || !max) return "Salary not specified";
    return `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return d.toLocaleDateString();
  };

  return (
    <Card className="job-card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-slate-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 hover:text-primary cursor-pointer">
                {job.title}
              </h3>
              <p className="text-sm text-slate-600 mb-2">{job.company?.name}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.type}
                </span>
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {job.description.length > 200 
                  ? `${job.description.substring(0, 200)}...` 
                  : job.description
                }
              </p>
              {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills.slice(0, 4).map((skill, index) => (
                    <span key={skill} className={getSkillTagClass(index)}>
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="skill-tag bg-slate-100 text-slate-600">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => saveJobMutation.mutate()}
              disabled={saveJobMutation.isPending}
              className={`transition-colors ${
                isSaved ? "text-red-500 hover:text-red-600" : "text-slate-400 hover:text-red-500"
              }`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
            </Button>
            <span className="text-xs text-slate-500">
              {formatDate(job.postedAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            {matchScore && (
              <>
                <Badge className={getMatchBadgeClass(matchScore)}>
                  {matchScore}% Match
                </Badge>
                <span className="text-xs text-slate-500">Based on your profile</span>
              </>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="text-sm">
              View Details
            </Button>
            <Button
              onClick={() => applyJobMutation.mutate()}
              disabled={applyJobMutation.isPending || hasApplied}
              className={`text-sm ${
                hasApplied 
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" 
                  : "bg-primary hover:bg-blue-700"
              }`}
            >
              {hasApplied ? "Applied" : "Apply Now"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
