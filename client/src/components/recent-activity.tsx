import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Heart, Calendar } from "lucide-react";

function getActivityIcon(type: string) {
  switch (type) {
    case "application":
      return Send;
    case "save":
      return Heart;
    case "interview":
      return Calendar;
    default:
      return Send;
  }
}

function getActivityIconColor(type: string) {
  switch (type) {
    case "application":
      return "text-green-600";
    case "save":
      return "text-red-600";
    case "interview":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
}

function getActivityIconBg(type: string) {
  switch (type) {
    case "application":
      return "bg-green-100";
    case "save":
      return "bg-red-100";
    case "interview":
      return "bg-blue-100";
    default:
      return "bg-gray-100";
  }
}

function formatActivityText(activity: any) {
  switch (activity.type) {
    case "application":
      return (
        <>
          Applied to <span className="font-medium">{activity.jobTitle}</span> at{" "}
          <span className="font-medium text-primary">{activity.companyName}</span>
        </>
      );
    case "save":
      return (
        <>
          Saved <span className="font-medium">{activity.jobTitle}</span> at{" "}
          <span className="font-medium text-primary">{activity.companyName}</span>
        </>
      );
    case "interview":
      return (
        <>
          Interview scheduled for <span className="font-medium">{activity.jobTitle}</span> at{" "}
          <span className="font-medium text-primary">{activity.companyName}</span>
        </>
      );
    default:
      return `Activity for ${activity.jobTitle}`;
  }
}

function formatTimestamp(timestamp: string | Date) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/dashboard/activity"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/activity");
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  return (
    <Card className="mb-8">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
      </div>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any, index: number) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 ${getActivityIconBg(activity.type)} rounded-full flex items-center justify-center`}>
                      <IconComponent className={`h-5 w-5 ${getActivityIconColor(activity.type)}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      {formatActivityText(activity)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                  {activity.status && activity.type === "application" && (
                    <div className="flex-shrink-0">
                      <Badge 
                        variant="secondary"
                        className={`${
                          activity.status === "pending" ? "status-pending" :
                          activity.status === "reviewed" ? "status-reviewed" :
                          activity.status === "interview" ? "status-interview" :
                          activity.status === "rejected" ? "status-rejected" :
                          activity.status === "accepted" ? "status-accepted" :
                          "status-pending"
                        }`}
                      >
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">No recent activity to show.</p>
            <p className="text-slate-400 text-sm mt-1">Start applying to jobs to see your activity here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
