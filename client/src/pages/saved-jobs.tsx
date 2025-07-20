import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import JobCard from "@/components/job-card";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { JobWithCompany } from "@shared/schema";

export default function SavedJobs() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: savedJobs, isLoading: savedJobsLoading } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/saved-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/saved-jobs");
      if (response.status === 401) {
        throw new Error("401: Unauthorized");
      }
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
          <p className="text-slate-600 mt-2">Jobs you've bookmarked for later review</p>
        </div>

        {savedJobsLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : savedJobs && savedJobs.length > 0 ? (
          <div className="space-y-6">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <Heart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Saved Jobs</h3>
            <p className="text-slate-500 mb-6">Start saving jobs you're interested in to build your list.</p>
            <a 
              href="/jobs" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
