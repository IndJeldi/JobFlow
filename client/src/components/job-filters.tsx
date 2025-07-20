import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface JobFiltersProps {
  onFilterChange?: (filters: {
    location?: string;
    type?: string;
    salaryMin?: string;
  }) => void;
}

export default function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [location, setLocation] = useState("");
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState("");

  const handleJobTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...jobTypes, type]
      : jobTypes.filter(t => t !== type);
    setJobTypes(newTypes);
  };

  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        location: location || undefined,
        type: jobTypes.length > 0 ? jobTypes[0] : undefined, // For simplicity, use first selected type
        salaryMin: salaryRange ? salaryRange.split("-")[0].replace(/\D/g, '') : undefined,
      });
    }
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Filters</h3>
        
        {/* Location Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Location
          </Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="New York, NY">New York, NY</SelectItem>
              <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
              <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
              <SelectItem value="London, UK">London, UK</SelectItem>
              <SelectItem value="Austin, TX">Austin, TX</SelectItem>
              <SelectItem value="Boston, MA">Boston, MA</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Job Type Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Job Type
          </Label>
          <div className="space-y-2">
            {[
              { id: "full-time", label: "Full-time" },
              { id: "part-time", label: "Part-time" },
              { id: "contract", label: "Contract" },
              { id: "internship", label: "Internship" },
            ].map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={jobTypes.includes(type.id)}
                  onCheckedChange={(checked) => 
                    handleJobTypeChange(type.id, checked as boolean)
                  }
                />
                <Label htmlFor={type.id} className="text-sm text-slate-600">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Salary Range */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Salary Range
          </Label>
          <Select value={salaryRange} onValueChange={setSalaryRange}>
            <SelectTrigger>
              <SelectValue placeholder="Any Salary" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Salary</SelectItem>
              <SelectItem value="40000-60000">$40,000 - $60,000</SelectItem>
              <SelectItem value="60000-80000">$60,000 - $80,000</SelectItem>
              <SelectItem value="80000-100000">$80,000 - $100,000</SelectItem>
              <SelectItem value="100000-120000">$100,000 - $120,000</SelectItem>
              <SelectItem value="120000-150000">$120,000 - $150,000</SelectItem>
              <SelectItem value="150000-200000">$150,000 - $200,000</SelectItem>
              <SelectItem value="200000+">$200,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={applyFilters}
          className="w-full bg-primary hover:bg-blue-700"
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
