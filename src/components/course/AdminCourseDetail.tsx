// @ts-nocheck
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, ChevronRight, Loader2 } from "lucide-react";
import { Course } from "@/data/coursesData";

interface NewCourseForm {
  title: string;
  category: string;
  duration: string;
  code: string;
}

export function AdminCourseDetail() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseForm>({
    title: "",
    category: "",
    duration: "",
    code: "",
  });

  const normalizeCoursesResponse = (raw: unknown): Course[] => {
    if (Array.isArray(raw)) return raw as Course[];
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      for (const key of ["data", "items", "results", "courses"]) {
        if (Array.isArray(obj[key])) return obj[key] as Course[];
      }
    }
    return [];
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<unknown>("/courses");
      setCourses(normalizeCoursesResponse(response));
    } catch (error: any) {
      toast.error(error?.message || "Unable to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) => {
      return [course.title, course.code, course.category, course.description, course.duration]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [courses, searchQuery]);

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.category || !newCourse.duration) {
      toast.error("Title, category, and duration are required.");
      return;
    }

    try {
      const payload = {
        title: newCourse.title,
        code: newCourse.code || `${newCourse.category.slice(0, 3).toUpperCase()}-${Date.now()}`,
        category: newCourse.category,
        duration: newCourse.duration,
        description: newCourse.title,
      };

      await apiFetch("/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Course added successfully.");
      setAddOpen(false);
      setNewCourse({ title: "", category: "", duration: "", code: "" });
      void loadCourses();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create course.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              All Courses
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View and manage every course in the catalog.
            </p>
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center gap-2 px-5 py-2.5">
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-3xl border border-slate-200 p-0 overflow-hidden">
              <DialogHeader className="bg-slate-50 px-6 py-5">
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  Add New Course
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 px-6 pb-6 pt-4">
                <div>
                  <Label htmlFor="course-title">Course title</Label>
                  <Input
                    id="course-title"
                    value={newCourse.title}
                    onChange={(event) => setNewCourse({ ...newCourse, title: event.target.value })}
                    placeholder="e.g. Web Design Fundamentals"
                  />
                </div>

                <div>
                  <Label htmlFor="course-category">Category</Label>
                  <Input
                    id="course-category"
                    value={newCourse.category}
                    onChange={(event) => setNewCourse({ ...newCourse, category: event.target.value })}
                    placeholder="e.g. Bachelor's"
                  />
                </div>

                <div>
                  <Label htmlFor="course-duration">Duration</Label>
                  <Input
                    id="course-duration"
                    value={newCourse.duration}
                    onChange={(event) => setNewCourse({ ...newCourse, duration: event.target.value })}
                    placeholder="e.g. 6 Months"
                  />
                </div>

                <div>
                  <Label htmlFor="course-code">Course code (optional)</Label>
                  <Input
                    id="course-code"
                    value={newCourse.code}
                    onChange={(event) => setNewCourse({ ...newCourse, code: event.target.value })}
                    placeholder="e.g. CS-101"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleAddCourse} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                    Create Course
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search courses by title, code, category or duration…"
              className="pl-10"
            />
          </div>
          <div className="text-sm text-slate-500">
            Showing {filteredCourses.length} of {courses.length} course{courses.length === 1 ? "" : "s"}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center text-slate-500">
            No courses found. Use the button above to add a new course.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden rounded-3xl border border-slate-200 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {course.code || "Course"}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{course.title}</h2>
                    <p className="mt-3 text-sm text-slate-500 line-clamp-3">{course.description || "No description provided."}</p>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {course.category || "General"}
                    </span>
                    <span className="text-sm text-slate-500">Duration: {course.duration || "N/A"}</span>
                    <Link to={`/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700">
                      View course
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}