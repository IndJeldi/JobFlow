import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, MapPin, Search, ExternalLink } from "lucide-react";

export default function StepstoneSyncComponent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");

  const syncJobsMutation = useMutation({
    mutationFn: async ({ location, keywords }: { location: string; keywords: string }) => {
      return apiRequest("/api/stepstone/sync", {
        method: "POST",
        body: JSON.stringify({ location, keywords }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Jobs Synced Successfully",
        description: `${data.jobs.length} new jobs have been imported from Stepstone.`,
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync jobs from Stepstone. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSync = () => {
    syncJobsMutation.mutate({ location, keywords });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
          Stepstone Job Sync
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Import fresh job opportunities from Stepstone to expand your search
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Berlin, Remote"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="keywords">Keywords</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., React, Frontend"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncJobsMutation.isPending}
          className="w-full"
        >
          {syncJobsMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing Jobs...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Jobs from Stepstone
            </>
          )}
        </Button>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium text-sm">About Stepstone Integration</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-2 h-2 rounded-full p-0 bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Real job listings</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-2 h-2 rounded-full p-0 bg-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Updated daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-2 h-2 rounded-full p-0 bg-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">Europe focused</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            This integration brings you fresh job opportunities from one of Europe's leading job platforms.
            All synced jobs will appear in your main job listings with the Stepstone source tag.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}