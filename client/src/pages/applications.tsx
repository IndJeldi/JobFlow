import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, DollarSign, Building2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ApplicationWithJob } from "@shared/schema";

function getStatusVariant(status: string) {
  switch (status) {
    case "pending":
      return "secondary";
    case "reviewed":
      return "default";
    case "interview":
      return "default";
    case "rejected":
      return "destructive";
    case "accepted":
      return "default";
    default:
      return "secondary";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "pending":
      return "status-pending";
    case "reviewed":
      return "status-reviewed";
    case "interview":
      return "status-interview";
    case "rejected":
      return "status-rejected";
    case "accepted":
      return "status-accepted";
    default:
      return "status-pending";
  }
}

export default function Applications() {
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

  const { data: applications, isLoading: applicationsLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-600 mt-2">Track the status of your job applications</p>
        </div>

        {applicationsLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id} className="job-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 hover:text-primary cursor-pointer">
                          {application.job.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {application.job.company?.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {application.job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {application.job.type}
                          </span>
                          {application.job.salaryMin && application.job.salaryMax && (
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ${application.job.salaryMin} - ${application.job.salaryMax}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Badge 
                        variant={getStatusVariant(application.status)} 
                        className={getStatusClass(application.status)}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Updated {new Date(application.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {application.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Cover Letter</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {application.coverLetter.substring(0, 200)}
                        {application.coverLetter.length > 200 && "..."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Applications Yet</h3>
            <p className="text-slate-500 mb-6">Start applying to jobs to track your applications here.</p>
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
