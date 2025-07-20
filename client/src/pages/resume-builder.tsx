import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Star, Download, Eye, Save } from "lucide-react";
import { nanoid } from "nanoid";

interface ResumeData {
  id?: number;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    website?: string;
    summary?: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    location?: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate: string;
    endDate?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  template: string;
  isDefault: boolean;
}

export default function ResumeBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentResumeId, setCurrentResumeId] = useState<number | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: "My Resume",
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      website: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    template: "modern",
    isDefault: false,
  });
  const [newSkill, setNewSkill] = useState("");

  // Fetch user resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["/api/resumes"],
  });

  // Create resume mutation
  const createResumeMutation = useMutation({
    mutationFn: async (data: ResumeData) => {
      return apiRequest("/api/resumes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setCurrentResumeId(newResume.id);
      toast({
        title: "Resume Created",
        description: "Your resume has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: async (data: ResumeData) => {
      return apiRequest(`/api/resumes/${currentResumeId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume Updated",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/resumes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      if (currentResumeId === deleteResumeMutation.variables) {
        setCurrentResumeId(null);
        setResumeData({
          title: "My Resume",
          personalInfo: {
            fullName: "",
            email: "",
            phone: "",
            location: "",
            linkedIn: "",
            website: "",
            summary: "",
          },
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          template: "modern",
          isDefault: false,
        });
      }
      toast({
        title: "Resume Deleted",
        description: "Resume has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (currentResumeId) {
      updateResumeMutation.mutate(resumeData);
    } else {
      createResumeMutation.mutate(resumeData);
    }
  };

  const loadResume = (resume: any) => {
    setCurrentResumeId(resume.id);
    setResumeData(resume);
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: nanoid(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
          location: "",
        },
      ],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((exp) => exp.id !== id),
    });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          id: nanoid(),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          current: false,
          gpa: "",
        },
      ],
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((edu) => edu.id !== id),
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Resume Builder
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage your professional resumes
            </p>
          </div>
          <Button onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Resume List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  My Resumes
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentResumeId(null);
                      setResumeData({
                        title: "My Resume",
                        personalInfo: {
                          fullName: "",
                          email: "",
                          phone: "",
                          location: "",
                          linkedIn: "",
                          website: "",
                          summary: "",
                        },
                        experience: [],
                        education: [],
                        skills: [],
                        projects: [],
                        certifications: [],
                        template: "modern",
                        isDefault: false,
                      });
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resumesLoading ? (
                  <p>Loading resumes...</p>
                ) : (
                  <div className="space-y-2">
                    {resumes?.map((resume: any) => (
                      <div
                        key={resume.id}
                        className={`p-3 rounded-lg border cursor-pointer ${
                          currentResumeId === resume.id
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => loadResume(resume)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{resume.title}</p>
                            {resume.isDefault && (
                              <Badge variant="outline" className="mt-1">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteResumeMutation.mutate(resume.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Resume Editor */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Input
                    value={resumeData.title}
                    onChange={(e) =>
                      setResumeData({ ...resumeData, title: e.target.value })
                    }
                    className="text-xl font-bold border-none p-0 h-auto"
                    placeholder="Resume Title"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={createResumeMutation.isPending || updateResumeMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personalInfo: {
                                ...resumeData.personalInfo,
                                fullName: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personalInfo: {
                                ...resumeData.personalInfo,
                                email: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.personalInfo.phone || ""}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personalInfo: {
                                ...resumeData.personalInfo,
                                phone: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={resumeData.personalInfo.location || ""}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personalInfo: {
                                ...resumeData.personalInfo,
                                location: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedIn">LinkedIn</Label>
                        <Input
                          id="linkedIn"
                          value={resumeData.personalInfo.linkedIn || ""}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personalInfo: {
                                ...resumeData.personalInfo,
                                linkedIn: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={resumeData.personalInfo.website || ""}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personalInfo: {
                                ...resumeData.personalInfo,
                                website: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={resumeData.personalInfo.summary || ""}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personalInfo: {
                              ...resumeData.personalInfo,
                              summary: e.target.value,
                            },
                          })
                        }
                        className="min-h-[100px]"
                        placeholder="Write a brief summary of your professional background and goals..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Work Experience</h3>
                      <Button onClick={addExperience}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                    {resumeData.experience.map((exp, index) => (
                      <Card key={exp.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Experience {index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeExperience(exp.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Company</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) =>
                                  updateExperience(exp.id, "company", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>Position</Label>
                              <Input
                                value={exp.position}
                                onChange={(e) =>
                                  updateExperience(exp.id, "position", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) =>
                                  updateExperience(exp.id, "startDate", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="month"
                                value={exp.endDate || ""}
                                onChange={(e) =>
                                  updateExperience(exp.id, "endDate", e.target.value)
                                }
                                disabled={exp.current}
                              />
                            </div>
                            <div>
                              <Label>Location</Label>
                              <Input
                                value={exp.location || ""}
                                onChange={(e) =>
                                  updateExperience(exp.id, "location", e.target.value)
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) =>
                                  updateExperience(exp.id, "current", e.target.checked)
                                }
                              />
                              <Label>Current Position</Label>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label>Description</Label>
                            <Textarea
                              value={exp.description}
                              onChange={(e) =>
                                updateExperience(exp.id, "description", e.target.value)
                              }
                              placeholder="Describe your responsibilities and achievements..."
                              className="min-h-[80px]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Education</h3>
                      <Button onClick={addEducation}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                    {resumeData.education.map((edu, index) => (
                      <Card key={edu.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Education {index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEducation(edu.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Institution</Label>
                              <Input
                                value={edu.institution}
                                onChange={(e) =>
                                  updateEducation(edu.id, "institution", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>Degree</Label>
                              <Input
                                value={edu.degree}
                                onChange={(e) =>
                                  updateEducation(edu.id, "degree", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>Field of Study</Label>
                              <Input
                                value={edu.field}
                                onChange={(e) =>
                                  updateEducation(edu.id, "field", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>GPA (Optional)</Label>
                              <Input
                                value={edu.gpa || ""}
                                onChange={(e) =>
                                  updateEducation(edu.id, "gpa", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="month"
                                value={edu.startDate}
                                onChange={(e) =>
                                  updateEducation(edu.id, "startDate", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="month"
                                value={edu.endDate || ""}
                                onChange={(e) =>
                                  updateEducation(edu.id, "endDate", e.target.value)
                                }
                                disabled={edu.current}
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={edu.current}
                              onChange={(e) =>
                                updateEducation(edu.id, "current", e.target.checked)
                              }
                            />
                            <Label>Currently Studying</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Skills</h3>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button onClick={addSkill}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill}
                          <Trash2 className="w-3 h-3 ml-2" />
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Projects</h3>
                      <Button
                        onClick={() => {
                          setResumeData({
                            ...resumeData,
                            projects: [
                              ...resumeData.projects,
                              {
                                id: nanoid(),
                                name: "",
                                description: "",
                                technologies: [],
                                url: "",
                                startDate: "",
                                endDate: "",
                              },
                            ],
                          });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                      </Button>
                    </div>
                    {resumeData.projects.map((project, index) => (
                      <Card key={project.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Project {index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setResumeData({
                                  ...resumeData,
                                  projects: resumeData.projects.filter(
                                    (p) => p.id !== project.id
                                  ),
                                });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Project Name</Label>
                              <Input
                                value={project.name}
                                onChange={(e) => {
                                  setResumeData({
                                    ...resumeData,
                                    projects: resumeData.projects.map((p) =>
                                      p.id === project.id
                                        ? { ...p, name: e.target.value }
                                        : p
                                    ),
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label>Project URL (Optional)</Label>
                              <Input
                                value={project.url || ""}
                                onChange={(e) => {
                                  setResumeData({
                                    ...resumeData,
                                    projects: resumeData.projects.map((p) =>
                                      p.id === project.id
                                        ? { ...p, url: e.target.value }
                                        : p
                                    ),
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label>Description</Label>
                            <Textarea
                              value={project.description}
                              onChange={(e) => {
                                setResumeData({
                                  ...resumeData,
                                  projects: resumeData.projects.map((p) =>
                                    p.id === project.id
                                      ? { ...p, description: e.target.value }
                                      : p
                                  ),
                                });
                              }}
                              placeholder="Describe the project, your role, and key achievements..."
                              className="min-h-[80px]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}