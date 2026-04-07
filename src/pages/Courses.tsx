// src/pages/Courses.tsx
"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen, Search, Plus, Copy, Loader2, Clock, Tag, ChevronRight,
  GraduationCap, Layers, Trash2, SlidersHorizontal, LayoutGrid,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { fetchPurchasedCourses } from "@/store/redux/thunks/PurchasedCoursesThunk";
import { RootState } from "@/store/redux/store";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { PurchasedCourse } from "@/store/purchasedCourses/types";

/* ─── category color map ──────────────────────────────── */
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Bachelor's": { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  "Master's":   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  "Doctorate":  { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200"   },
  "Diploma":    { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200"   },
  "Certificate":{ bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200"    },
};
const fallbackColor = { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };

function getCategoryStyle(cat?: string) {
  return categoryColors[cat ?? ""] ?? fallbackColor;
}

/* ─── skeleton card ───────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-orange-100/70 bg-white shadow-sm shadow-orange-50/80 animate-pulse">
      <div className="h-44 bg-gradient-to-br from-orange-50 via-amber-100 to-orange-50" />
      <div className="space-y-4 p-5">
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="h-6 w-3/4 rounded-2xl bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-16 rounded-3xl bg-slate-200" />
          <div className="h-16 rounded-3xl bg-slate-200" />
        </div>
        <div className="h-10 rounded-3xl bg-orange-100" />
      </div>
    </div>
  );
}

/* ─── course card ─────────────────────────────────────── */
function CourseCard({
  course, isAdmin, duplicatingId, onDelete, onDuplicate,
}: {
  course: PurchasedCourse;
  isAdmin: boolean;
  duplicatingId: string | number | null;
  onDelete: (id: string | number) => void;
  onDuplicate: (c: PurchasedCourse) => void;
}) {
  const coverImage = course.image_cover || (course as any).image;
  const catStyle = getCategoryStyle(course.category);
  const courseCode = (course as any).code || course.label || "—";
  const instructor = course.teacher?.full_name || "Instructor not available";
  const progress = course.progress_percent ?? course.progress ?? null;
  const statusLabel = course.status || (course.expired ? "Expired" : "Active");
  const statusColor = /expired|inactive/i.test(statusLabel)
    ? "text-rose-600 bg-rose-50 border-rose-200"
    : /active|ongoing|published/i.test(statusLabel)
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : "text-slate-600 bg-slate-100 border-slate-200";
  const accessDays = course.access_days || "Unlimited";
  const purchasedAt = course.purchased_at
    ? new Date(course.purchased_at).toLocaleDateString()
    : course.start_date
      ? new Date(course.start_date).toLocaleDateString()
      : "N/A";
  const price = course.price ? course.price : "Free";

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-orange-100/60 bg-white shadow-sm shadow-orange-50/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100/80">

      {/* ── image / cover ── */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-orange-50 via-amber-100 to-amber-50">
        {coverImage ? (
          <img
            src={coverImage}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <GraduationCap className="h-16 w-16 text-orange-200" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <span className={`absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
          <Tag className="h-3 w-3" />
          {course.category || "General"}
        </span>

        <span className={`absolute right-4 top-4 z-10 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* ── body ── */}
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
            {courseCode}
          </p>
          <h3 className="line-clamp-2 text-xl font-bold leading-tight text-slate-900">
            {course.title}
          </h3>
        </div>

        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Duration</p>
            <p className="mt-1 font-semibold text-slate-800">{course.duration || "N/A"}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Instructor</p>
            <p className="mt-1 font-semibold text-slate-800">{instructor}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Progress</p>
            <p className="mt-1 font-semibold text-slate-800">{progress != null ? `${progress}%` : "N/A"}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Access</p>
            <p className="mt-1 font-semibold text-slate-800">{accessDays}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Purchased</p>
            <p className="mt-1 font-semibold text-slate-800">{purchasedAt}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Price</p>
            <p className="mt-1 font-semibold text-slate-800">{price}</p>
          </div>
        </div>

        <div className="mt-auto">
          <Link to={`/courses/${course.id}`} className="block">
            <button className="group/btn flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition-all duration-200 hover:from-orange-600 hover:to-amber-500 hover:shadow-md hover:shadow-orange-200">
              View Details
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── main page ───────────────────────────────────────── */
export default function Courses() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { items: purchasedCourses, loading, error } = useSelector(
    (state: RootState) => state.purchasedCourses
  );

  const [courses, setCourses]           = useState<PurchasedCourse[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", duration: "", category: "", code: "" });
  const [attachments, setAttachments]   = useState<File[]>([]);
  const [duplicatingCourseId, setDuplicatingCourseId] = useState<string | number | null>(null);
  const requestIdRef = useRef(0);

  /* ── helpers (unchanged) ── */
  const dedupeCourses = (items: PurchasedCourse[]) => {
    const seen = new Set<number | string>();
    const result: PurchasedCourse[] = [];
    for (const course of items || []) {
      if (course?.id && !seen.has(course.id)) { seen.add(course.id); result.push(course); }
    }
    return result;
  };

  function normalizeCoursesResponse(raw: unknown): PurchasedCourse[] {
    if (Array.isArray(raw)) return raw as PurchasedCourse[];
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      for (const key of ["data", "items", "results", "courses"]) {
        if (Array.isArray(obj[key])) return obj[key] as PurchasedCourse[];
      }
    }
    return [];
  }

  async function fetchCatalog(): Promise<PurchasedCourse[]> {
    const res = await apiFetch<unknown>("/courses");
    return normalizeCoursesResponse(res);
  }

  const loadCourses = async () => {
    const requestId = ++requestIdRef.current;
    setAdminLoading(true);
    try {
      const data = await fetchCatalog();
      if (requestId !== requestIdRef.current) return;
      setCourses(dedupeCourses(data));
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      if (requestId === requestIdRef.current) setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) dispatch(fetchPurchasedCourses() as any);
    else loadCourses();
  }, [user, isAdmin]);

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.category || !newCourse.duration) {
      toast.error("Please fill all required fields"); return;
    }
    try {
      const courseCode = newCourse.code || `${newCourse.category.substring(0, 3).toUpperCase()}-${Date.now()}`;
      const created = await apiFetch<{ id: string }>("/courses", {
        method: "POST",
        body: JSON.stringify({ title: newCourse.title, code: courseCode, category: newCourse.category, duration: newCourse.duration, description: newCourse.title }),
      });
      if (attachments.length > 0 && created?.id) {
        for (const file of attachments) {
          const fd = new FormData();
          fd.append("course_id", created.id);
          fd.append("title", file.name);
          fd.append("file", file);
          await apiFetch("/materials", { method: "POST", body: fd }).catch(() => {});
        }
      }
      toast.success("Course added successfully");
      setAddDialogOpen(false);
      setNewCourse({ title: "", duration: "", category: "", code: "" });
      setAttachments([]);
      void loadCourses();
    } catch (e: any) { toast.error(e?.message || "Failed to add course"); }
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await apiFetch(`/courses/${courseId}`, { method: "DELETE" });
      toast.success("Course deleted");
      void loadCourses();
    } catch (e: any) { toast.error(e?.message || "Failed to delete course"); }
  };

  const handleDuplicateCourse = async (course: PurchasedCourse) => {
    setDuplicatingCourseId(course.id);
    try {
      await apiFetch(`/courses/${course.id}/duplicate`, { method: "POST" });
      toast.success(`Course duplicated: ${course.title}`);
      void loadCourses();
    } catch (e: any) { toast.error(e?.message || "Failed to duplicate course"); }
    finally { setDuplicatingCourseId(null); }
  };

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const source = (isAdmin ? courses : purchasedCourses) ?? [];
    if (!Array.isArray(source)) return [];
    if (!q) return source;
    return source.filter((c) => {
      const title = c.title?.toLowerCase() || "";
      const desc  = (c as any).description?.toLowerCase?.() || "";
      const code  = (c as any).code?.toLowerCase?.() || "";
      return title.includes(q) || desc.includes(q) || code.includes(q);
    });
  }, [courses, purchasedCourses, searchQuery, isAdmin]);

  const isLoading = isAdmin ? adminLoading : loading;
  const totalCount = (isAdmin ? courses : purchasedCourses)?.length ?? 0;

  /* ── JSX ── */
  return (
    <div className="space-y-8 pb-12">

      {/* ── Page hero header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 px-8 py-8 shadow-lg shadow-orange-200">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-amber-300/20" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-white/80" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                {isAdmin ? "Administration" : "Learning Hub"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Course Catalog
            </h1>
            <p className="mt-1 text-sm text-white/75">
              {isAdmin
                ? `Managing ${totalCount} course${totalCount !== 1 ? "s" : ""}`
                : "Explore everything you're enrolled in"}
            </p>
          </div>

          {/* Add Course button (admin) */}
          {isAdmin && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-md transition-all duration-200 hover:bg-orange-50 hover:shadow-lg active:scale-95">
                  <Plus className="h-4 w-4" />
                  Add New Course
                </button>
              </DialogTrigger>

              <DialogContent className="rounded-2xl border border-orange-100 p-0 overflow-hidden">
                {/* dialog header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-4">
                  <DialogTitle className="text-lg font-bold text-white">Add New Course</DialogTitle>
                  <p className="text-xs text-white/70 mt-0.5">Fill in the details below to create a new course</p>
                </div>

                <div className="space-y-4 p-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Course Name *</Label>
                    <Input
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="rounded-xl border-orange-100 focus-visible:ring-orange-400"
                      placeholder="e.g. Introduction to Data Science"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Duration *</Label>
                    <Input
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      className="rounded-xl border-orange-100 focus-visible:ring-orange-400"
                      placeholder="e.g. 3 Years, 6 Months"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Program Category *</Label>
                    <Select value={newCourse.category} onValueChange={(val) => setNewCourse({ ...newCourse, category: val })}>
                      <SelectTrigger className="rounded-xl border-orange-100 focus:ring-orange-400">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {["Bachelor's", "Master's", "Doctorate", "Diploma", "Certificate"].map((c) => (
                          <SelectItem key={c} value={c}>{c === "Bachelor's" ? "Bachelor's Degree" : c === "Master's" ? "Master's Degree" : c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Course Code <span className="normal-case font-normal text-slate-400">(optional)</span></Label>
                    <Input
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      className="rounded-xl border-orange-100 focus-visible:ring-orange-400"
                      placeholder="e.g. CS-101"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Attachments <span className="normal-case font-normal text-slate-400">(optional)</span></Label>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                      className="rounded-xl border-orange-100 text-sm"
                    />
                  </div>

                  <button
                    onClick={handleAddCourse}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-200 transition-all hover:from-orange-600 hover:to-amber-500 hover:shadow-md active:scale-95"
                  >
                    Create Course
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-300" />
          <input
            type="text"
            placeholder="Search by title, code or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* result count pill */}
        {!isLoading && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
            <LayoutGrid className="h-3.5 w-3.5" />
            {filteredCourses.length} result{filteredCourses.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {/* loading skeletons */}
        {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

        {/* course cards */}
        {!isLoading && filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isAdmin={isAdmin}
            duplicatingId={duplicatingCourseId}
            onDelete={handleDeleteCourse}
            onDuplicate={handleDuplicateCourse}
          />
        ))}

        {/* empty state */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
              <BookOpen className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No courses found</h3>
            <p className="mt-1 max-w-xs text-sm text-slate-400">
              {isAdmin
                ? 'Click "Add New Course" to publish your first course.'
                : "You haven't been enrolled in any courses yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}