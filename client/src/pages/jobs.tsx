import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import JobCard from "@/components/job-card";
import JobFilters from "@/components/job-filters";
import StepstoneSyncComponent from "@/components/stepstone-sync";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { JobWithCompany } from "@shared/schema";

export default function Jobs() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchKeywords, setSearchKeywords] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    salaryMin: "",
    keywords: "",
  });

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

  const { data: jobs, isLoading: jobsLoading, refetch } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.location) params.append("location", filters.location);
      if (filters.type) params.append("type", filters.type);
      if (filters.salaryMin) params.append("salaryMin", filters.salaryMin);
      if (filters.keywords) params.append("keywords", filters.keywords);
      params.append("limit", "20");

      const response = await fetch(`/api/jobs?${params.toString()}`);
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

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, keywords: searchKeywords }));
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

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
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="lg:w-1/4 space-y-6">
            <JobFilters onFilterChange={handleFilterChange} />
            <StepstoneSyncComponent />
          </aside>
          
          {/* Main Content */}
          <main className="lg:w-3/4">
            
            {/* Search and Sort Controls */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Search for jobs, companies, keywords..."
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 pr-4 py-3"
                    />
                    <Search className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Sort by: Most Recent</SelectItem>
                      <SelectItem value="match">Sort by: Best Match</SelectItem>
                      <SelectItem value="salary">Sort by: Salary High to Low</SelectItem>
                      <SelectItem value="company">Sort by: Company Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch} className="bg-primary hover:bg-blue-700">
                    Search Jobs
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Job Listings */}
            <div className="space-y-6">
              {jobsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard key={job.id} job={job} showMatchScore />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-500 text-lg">No jobs found matching your criteria.</p>
                  <p className="text-slate-400 text-sm mt-2">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
            
            {/* Load More */}
            {jobs && jobs.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="px-6 py-3">
                  Load More Jobs
                </Button>
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  );
}
