import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Briefcase, Search, Bell, ChevronDown } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", active: location === "/" },
    { href: "/jobs", label: "Browse Jobs", active: location === "/jobs" },
    { href: "/applications", label: "Applications", active: location === "/applications" },
    { href: "/saved-jobs", label: "Saved Jobs", active: location === "/saved-jobs" },
    { href: "/resume-builder", label: "Resume Builder", active: location === "/resume-builder" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold text-slate-900">JobFlow</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    item.active
                      ? "text-slate-900 border-b-2 border-primary"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden lg:block relative">
              <Input
                type="text"
                placeholder="Search jobs, companies..."
                className="w-80 pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-400" />
              <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-400 ring-2 ring-white"></span>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-slate-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Job Alerts
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
