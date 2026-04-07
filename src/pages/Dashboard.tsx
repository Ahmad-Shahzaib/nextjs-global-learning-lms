import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Clock, PlayCircle, Trash2, Copy, Edit2,
  Users, ShoppingCart, TicketCheck, Wallet, MessageCircle, CalendarCheck2,
  MessageSquare, TrendingUp, Bell, ChevronRight,
} from "lucide-react";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEditMode } from "@/contexts/EditModeContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchAdminDashboardStats } from "@/store/redux/thunks/adminDashboardThunk";
import { fetchUserDashboardInfo } from "@/store/redux/thunks/userDashboardThunk";

interface Course {
  id: string;
  title: string;
  code: string;
  progress: number;
  instructor: string | null;
  next_class: string | null;
  grade: string | null;
}

/* ─── Professional Stat Card ─────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  loading = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  accent?: "primary" | "accent" | "success" | "warn";
  loading?: boolean;
}) {
  const accentMap = {
    primary: "border-violet-200/80 bg-white/90 dark:border-violet-800/80 dark:bg-slate-950/80",
    accent: "border-indigo-200/80 bg-white/90 dark:border-indigo-800/80 dark:bg-slate-950/80",
    success: "border-emerald-200/80 bg-white/90 dark:border-emerald-800/80 dark:bg-slate-950/80",
    warn: "border-amber-200/80 bg-white/90 dark:border-amber-800/80 dark:bg-slate-950/80",
  };

  const iconMap = {
    primary: "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  };

  return (
    <Card className={`group min-h-[150px] overflow-hidden rounded-[1.75rem] border p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${accentMap[accent]}`}>
      <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <div className={`rounded-3xl p-3 ${iconMap[accent]}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {loading ? <span className="inline-block h-10 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" /> : value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Dashboard Component ───────────────────────────────────── */
export default function Dashboard() {
  const { isEditMode, isAdmin, isEditor } = useEditMode();
  const isPrivileged = isAdmin || isEditor;
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { counts: adminCounts, loading: adminLoading, error: adminError } = useAppSelector(
    (state) => state.adminDashboard
  );

  const { data: userDashboard, loading: userLoading } = useAppSelector(
    (state) => state.userDashboard
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalActivity: 0, inProgress: 0, completed: 0, totalCourses: 0,
  });

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAdminDashboardStats());
    } else if (user) {
      dispatch(fetchUserDashboardInfo());
    }
  }, [isAdmin, user, dispatch]);

  useEffect(() => {
    if (!isAdmin && userDashboard) {
      if (Array.isArray(userDashboard.courses)) setCourses(userDashboard.courses);
      setStats({
        totalActivity: userDashboard.totalActivity ?? 0,
        inProgress: userDashboard.inProgress ?? 0,
        completed: userDashboard.completed ?? 0,
        totalCourses: userDashboard.totalCourses ?? 0,
      });
    }
  }, [isAdmin, userDashboard]);

  // Local edit handlers (UI-only)
  const updateCourse = async (id: string, field: string, value: any) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    toast.success("Course updated");
  };

  const deleteCourse = async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    toast.success("Course removed");
  };

  const duplicateCourse = async (course: Course) => {
    const copy: Course = {
      ...course,
      id: `${course.id}-copy-${Date.now()}`,
      title: `${course.title} (Copy)`,
    };
    setCourses((prev) => [copy, ...prev]);
    toast.success("Course duplicated");
  };

  return (
    <div className="space-y-10 pb-12 px-4 sm:px-6 lg:px-8">
      <WelcomeDialog />

      <div className="mx-auto w-full max-w-[1200px] rounded-[2rem] border border-slate-200/70 bg-slate-50/85 p-6 shadow-sm shadow-slate-400/5 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/65">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {isAdmin ? "Administration" : "Learning Management"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Your learning and platform overview, redesigned with cleaner cards and clearer hierarchy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isEditMode && (
              <Badge variant="outline" className="rounded-full border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200">
                <Edit2 className="h-4 w-4" />
                Edit Mode Active
              </Badge>
            )}
            {isAdmin && (
              <Badge className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/20">
                Admin View
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold tracking-tight">Platform Overview</h2>
          </div>

          {adminError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
              {adminError}
            </div>
          )}

          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            <StatCard label="Total Users" value={adminCounts?.total_users ?? "—"} icon={Users} accent="primary" loading={adminLoading} />
            <StatCard label="Total Courses" value={adminCounts?.total_courses ?? "—"} icon={BookOpen} accent="accent" loading={adminLoading} />
            <StatCard label="Total Sales" value={adminCounts?.total_sales ?? "—"} icon={ShoppingCart} accent="success" loading={adminLoading} />
            <StatCard label="Open Tickets" value={adminCounts?.open_tickets ?? "—"} icon={TicketCheck} accent="warn" loading={adminLoading} />
          </div>
        </section>
      )}

      {/* User Stats */}
      {!isAdmin && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold tracking-tight">Your Activity</h2>
          </div>

          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            <StatCard label="Account Balance" value={`$${userDashboard?.balance ?? 0}`} icon={Wallet} accent="success" loading={userLoading} />
            <StatCard label="Purchased Courses" value={userDashboard?.webinarsCount ?? 0} icon={BookOpen} accent="accent" loading={userLoading} />
            <StatCard label="Support Messages" value={userDashboard?.supportsCount ?? 0} icon={MessageCircle} accent="primary" loading={userLoading} />
            <StatCard label="Scheduled Meetings" value={userDashboard?.reserveMeetingsCount ?? 0} icon={CalendarCheck2} accent="warn" loading={userLoading} />
            <StatCard label="Comments Posted" value={userDashboard?.commentsCount ?? 0} icon={MessageSquare} accent="primary" loading={userLoading} />
          </div>
        </section>
      )}

      {/* Enrolled Courses */}
      {courses.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-violet-600" />
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Enrolled Courses</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">A refined view of your active courses and progress.</p>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-semibold">
              {courses.length} Course{courses.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group relative min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-950/80"
              >
                {isEditMode && (
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button size="icon" variant="ghost" onClick={() => duplicateCourse(course)} className="h-9 w-9">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteCourse(course.id)} className="h-9 w-9 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <CardHeader className="space-y-4 border-b border-slate-200/80 px-6 pb-5 pt-6 dark:border-slate-700/80">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className="font-mono text-xs tracking-[0.18em] text-slate-600 dark:text-slate-300">
                      {course.code}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                      {course.grade ?? "In Progress"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 px-6 pb-6 pt-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{course.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500 transition-all duration-700"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 text-sm text-slate-700 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Instructor</span>
                      <span className="font-medium">{course.instructor ?? "TBA"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Next Class</span>
                      <span className="font-medium">{course.next_class ?? "Not scheduled"}</span>
                    </div>
                  </div>

                  {!isEditMode ? (
                    <Button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-700 hover:to-indigo-700"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <PlayCircle className="h-5 w-5" />
                        Continue Learning
                        <ChevronRight className="h-5 w-5 opacity-80" />
                      </div>
                    </Button>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <Input
                        value={course.title}
                        onChange={(e) => updateCourse(course.id, "title", e.target.value)}
                        placeholder="Course Title"
                      />
                      <Input
                        value={course.code}
                        onChange={(e) => updateCourse(course.id, "code", e.target.value)}
                        placeholder="Course Code"
                      />
                      <Input
                        type="number"
                        value={course.progress}
                        onChange={(e) => updateCourse(course.id, "progress", parseInt(e.target.value) || 0)}
                        placeholder="Progress (%)"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Noticeboard */}
      {!isAdmin && userDashboard?.unread_noticeboards?.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-600" />
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Noticeboard</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stay on top of unread announcements and updates.</p>
              </div>
            </div>
            <Badge className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-amber-500/20">
              {userDashboard.unread_noticeboards.length} Unread
            </Badge>
          </div>

          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
            {userDashboard.unread_noticeboards.map((notice: any) => (
              <Card key={notice.id} className="overflow-hidden rounded-[1.75rem] border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white shadow-sm dark:border-amber-900/50 dark:from-amber-950/20 dark:to-slate-950">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg leading-tight mb-3">{notice.title}</h4>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notice.message}</p>
                  {notice.created_at && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(Number(notice.created_at) * 1000).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}