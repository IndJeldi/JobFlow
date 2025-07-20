import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import StatsCards from "@/components/stats-cards";
import RecentActivity from "@/components/recent-activity";
import JobCard from "@/components/job-card";
import JobFilters from "@/components/job-filters";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { JobWithCompany } from "@shared/schema";

export default function Dashboard() {
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

  const { data: jobs, isLoading: jobsLoading } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs?limit=6");
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <JobFilters />
          </aside>
          
          {/* Main Content */}
          <main className="lg:w-3/4">
            
            {/* Dashboard Stats */}
            <StatsCards />
            
            {/* Recent Activity */}
            <RecentActivity />
            
            {/* Job Recommendations */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Recommended Jobs</h2>
              <div className="space-y-6">
                
                {jobsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-64" />
                  ))
                ) : jobs && jobs.length > 0 ? (
                  jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No job recommendations available at the moment.</p>
                  </div>
                )}
                
              </div>
              
              {/* Load More */}
              {jobs && jobs.length > 0 && (
                <div className="text-center mt-8">
                  <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors">
                    Load More Jobs
                  </button>
                </div>
              )}
            </div>
            
          </main>
        </div>
      </div>
    </div>
  );
}
