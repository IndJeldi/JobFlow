import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Search, Bell, UserCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-slate-900">JobFlow</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-blue-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Find Your Dream Job with
            <span className="text-primary"> JobFlow</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Streamline your job search with our powerful platform. Track applications, 
            get personalized job recommendations, and stay organized throughout your career journey.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-blue-700 text-lg px-8 py-3"
          >
            Get Started for Free
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Search className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Smart Job Search
              </h3>
              <p className="text-slate-600 text-sm">
                Find relevant jobs with our intelligent search and filtering system
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <UserCheck className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Application Tracking
              </h3>
              <p className="text-slate-600 text-sm">
                Keep track of all your applications and their status in one place
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Bell className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Job Alerts
              </h3>
              <p className="text-slate-600 text-sm">
                Get notified when new jobs matching your criteria are posted
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Career Dashboard
              </h3>
              <p className="text-slate-600 text-sm">
                Visualize your job search progress with detailed analytics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Ready to accelerate your job search?
              </h2>
              <p className="text-slate-600 mb-6">
                Join thousands of job seekers who have found their dream jobs with JobFlow.
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-blue-700"
              >
                Start Your Journey Today
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
