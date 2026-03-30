// src/pages/Courses.tsx
"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Search, Plus, Copy, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { fetchPurchasedCourses } from "@/store/redux/thunks/PurchasedCoursesThunk";
import { RootState } from "@/store/redux/store";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";


// PurchasedCourse type comes from the store
import { PurchasedCourse } from "@/store/purchasedCourses/types";

export default function Courses() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { items: purchasedCourses, loading, error } = useSelector((state: RootState) => state.purchasedCourses);
  // Only used for admin
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  // Local loading state for admin
  const [adminLoading, setAdminLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    duration: "",
    category: "",
    code: ""
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const dedupeCourses = (items: PurchasedCourse[]) => {
    const seen = new Set<number | string>();
    const result: PurchasedCourse[] = [];
    for (const course of items || []) {
      if (course?.id && !seen.has(course.id)) {
        seen.add(course.id);
        result.push(course);
      }
    }
    return result;
  };
  const [duplicatingCourseId, setDuplicatingCourseId] = useState<string | number | null>(null);


  const requestIdRef = useRef(0);


  function normalizeCoursesResponse(raw: unknown): PurchasedCourse[] {
    // WHY: Backend occasionally returns different shapes; normalize once.
    if (Array.isArray(raw)) return raw as PurchasedCourse[];

    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      const candidates = ["data", "items", "results", "courses"];
      for (const key of candidates) {
        const val = obj[key];
        if (Array.isArray(val)) return val as PurchasedCourse[];
      }
    }
    return [];
  }

  async function fetchCourseDetail(courseId: string | number) {
    if (!courseId) return null;
    const data = await apiFetch<any>(`/v2/panel/webinars/${courseId}`);
    if (data && typeof data === "object" && "success" in data) {
      return Array.isArray(data.data) ? data.data[0] || null : data.data;
    }
    return data;
  }

  async function fetchCatalog(): Promise<PurchasedCourse[]> {
    const res = await apiFetch<unknown>("/courses");
    return normalizeCoursesResponse(res);
  }

  // -------------------------------------------------------------------------


  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      dispatch(fetchPurchasedCourses() as any);
    } else {
      loadCourses();
    }
  }, [user, isAdmin, dispatch]);

  // Only used for admin, keep the old logic for admin
  const loadCourses = async () => {
    const requestId = ++requestIdRef.current;
    setAdminLoading(true);
    try {
      const data = await fetchCatalog();
      if (requestId !== requestIdRef.current) return;
      setCourses(dedupeCourses(data));
      setAdminLoading(false);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("Failed to load courses", error);
      toast.error("Failed to load courses");
      setCourses([]);
      setAdminLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.category || !newCourse.duration) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const courseCode =
        newCourse.code ||
        `${newCourse.category.substring(0, 3).toUpperCase()}-${Date.now()}`;

      const created = await apiFetch<{ id: string }>("/courses", {
        method: "POST",
        body: JSON.stringify({
          title: newCourse.title,
          code: courseCode,
          category: newCourse.category,
          duration: newCourse.duration,
          description: newCourse.title
        })
      });

      if (attachments.length > 0 && created?.id) {
        for (const file of attachments) {
          const fd = new FormData();
          fd.append("course_id", created.id);
          fd.append("title", file.name);
          fd.append("file", file);
          await apiFetch("/materials", { method: "POST", body: fd }).catch(() => {
            /* WHY: don't block course creation on attachment failures */
          });
        }
      }

      toast.success("Course added successfully");
      setAddDialogOpen(false);
      setNewCourse({ title: "", duration: "", category: "", code: "" });
      setAttachments([]);
      void loadCourses();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add course");
    }
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    if (
      !confirm("Are you sure you want to delete this course? This action cannot be undone.")
    ) {
      return;
    }

    try {
      await apiFetch(`/courses/${courseId}`, { method: "DELETE" });
      toast.success("Course deleted");
      void loadCourses();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete course");
    }
  };

  const handleDuplicateCourse = async (course: PurchasedCourse) => {
    setDuplicatingCourseId(course.id);
    try {
      await apiFetch(`/courses/${course.id}/duplicate`, {
        method: "POST",
      });
      toast.success(`Course duplicated: ${course.title}`);
      void loadCourses();
    } catch (error: any) {
      toast.error(error?.message || "Failed to duplicate course");
    } finally {
      setDuplicatingCourseId(null);
    }
  };

  // For admin, use local state; for user, use Redux state
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const source = (isAdmin ? courses : purchasedCourses) ?? [];
    if (!Array.isArray(source)) return [];
    if (!q) return source;
    return source.filter((c) => {
      const title = c.title?.toLowerCase() || "";
      // PurchasedCourse may not have description/code fields, use fallback safely
      const desc = (c as any).description?.toLowerCase?.() || "";
      const code = (c as any).code?.toLowerCase?.() || "";
      return title.includes(q) || desc.includes(q) || code.includes(q);
    });
  }, [courses, purchasedCourses, searchQuery, isAdmin]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Course Catalog</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Manage your courses" : "Browse all available courses"}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Course
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Course Name *</Label>
                  <Input
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Duration *</Label>
                  <Input
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, duration: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Program Category *</Label>
                  <Select
                    value={newCourse.category}
                    onValueChange={(val) =>
                      setNewCourse({ ...newCourse, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's">Master's Degree</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Course Code (Optional)</Label>
                  <Input
                    value={newCourse.code}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, code: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Attachments (Optional)</Label>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setAttachments(Array.from(e.target.files || []))
                    }
                  />
                </div>

                <Button onClick={handleAddCourse} className="w-full">
                  Add Course
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(isAdmin ? adminLoading : loading) && (
          <Card className="p-12 text-center col-span-full">Loading courses…</Card>
        )}

        {!(isAdmin ? adminLoading : loading) &&
          filteredCourses.map((course) => {
            const coverImage = (course as any).image || (course as any).image;
            return (
              <Card key={course.id} className="overflow-hidden h-full hover:shadow-xl transition-all border border-border/30">
                <div className="relative h-44 w-full bg-slate-100">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <Badge className="absolute left-3 top-3 z-10 text-white bg-black/60 border border-white/30">
                    {course.category || "Uncategorized"}
                  </Badge>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>

                  <p className="text-sm text-muted-foreground line-clamp-1">{(course as any).code || "No code"}</p>

                  <div className="text-xs text-muted-foreground">
                    Duration: {course.duration || "N/A"}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="flex-1"
                      onMouseEnter={() =>
                        queryClient.prefetchQuery({
                          queryKey: ["courseDetail", course.id, user?.id],
                          queryFn: () => fetchCourseDetail(course.id),
                          staleTime: 15 * 60 * 1000,
                          retry: 1,
                        })
                      }
                    >
                      <Button className="w-full">View Details</Button>
                    </Link>
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          className="text-xs whitespace-nowrap"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

        {!(isAdmin ? adminLoading : loading) && filteredCourses.length === 0 && (
          <Card className="p-12 text-center col-span-full">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Add your first course to get started"
                : "You haven't been enrolled yet"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
