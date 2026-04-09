import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Clock, PlayCircle, Trash2, Copy, Edit2,
  Users, ShoppingCart, TicketCheck, MessageCircle,
  CalendarCheck2, MessageSquare, TrendingUp, Bell, ChevronRight,
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

/* ─── Modern Premium Stat Card (Best of Both) ───────────────────── */
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
    primary: "from-violet-500 to-indigo-600",
    accent: "from-blue-500 to-cyan-500",
    success: "from-emerald-500 to-teal-600",
    warn: "from-amber-500 to-orange-500",
  };

  const bgMap = {
    primary: "bg-orange-50 dark:bg-[#1a1410] border-orange-200/70 dark:border-[#2e2218]",
    accent: "bg-orange-50 dark:bg-[#1a1410] border-orange-200/70 dark:border-[#2e2218]",
    success: "bg-orange-50 dark:bg-[#1a1410] border-orange-200/70 dark:border-[#2e2218]",
    warn: "bg-orange-50 dark:bg-[#1a1410] border-orange-200/70 dark:border-[#2e2218]",
  };

  const iconBgMap = {
    primary: "bg-white dark:bg-[#0f0d0b] shadow-md shadow-violet-500/20 dark:shadow-orange-500/20",
    accent: "bg-white dark:bg-[#0f0d0b] shadow-md shadow-blue-500/20 dark:shadow-amber-500/20",
    success: "bg-white dark:bg-[#0f0d0b] shadow-md shadow-emerald-500/20",
    warn: "bg-white dark:bg-[#0f0d0b] shadow-md shadow-amber-500/20",
  };

  const iconColorMap = {
    primary: "text-violet-600 dark:text-orange-500",
    accent: "text-blue-600 dark:text-amber-500",
    success: "text-emerald-600 dark:text-emerald-500",
    warn: "text-amber-600 dark:text-amber-500",
  };

  const textColor = "text-orange-950 dark:text-[#f5efe8]";

  return (
    <Card className={`group relative min-h-[140px] overflow-hidden rounded-3xl border p-0 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${bgMap[accent]}`}>
      <div className={`absolute inset-0 bg-gradient-to-br opacity-10 dark:opacity-5 ${accentMap[accent]}`} />

      <CardContent className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.32em] text-orange-700 dark:text-orange-500 uppercase">
              {label}
            </p>
            <p className={`mt-2 text-3xl font-semibold tracking-tight ${textColor}`}>
              {loading ? (
                <span className="inline-block h-10 w-20 animate-pulse rounded-2xl bg-orange-200 dark:bg-[#2e2218]" />
              ) : (
                value
              )}
            </p>
          </div>

          <div className={`rounded-2xl p-2.5 transition-all duration-300 group-hover:scale-105 ${iconBgMap[accent]}`}>
            <Icon className={`h-7 w-7 ${iconColorMap[accent]}`} />
          </div>
        </div>

        <div className={`absolute bottom-4 left-5 h-1 w-12 rounded-full bg-gradient-to-r ${accentMap[accent]}`} />
      </CardContent>
    </Card>
  );
}

/* ─── Main Dashboard Component ───────────────────────────────────── */
export default function Dashboard() {
  const { isEditMode, isAdmin, isEditor } = useEditMode();
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

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAdminDashboardStats());
    } else if (user) {
      dispatch(fetchUserDashboardInfo());
    }
  }, [isAdmin, user, dispatch]);

  useEffect(() => {
    if (!isAdmin && userDashboard?.courses) {
      setCourses(userDashboard.courses);
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
    <div className="space-y-4 pb-12 p-4 bg-orange-50 dark:bg-[#0f0d0b] rounded-lg text-orange-950 dark:text-[#f5efe8]">
      <WelcomeDialog />

      {/* Header */}
      <div className="mx-auto w-full max-w-full xl:max-w-[1200px] rounded-2xl border border-orange-200/70 dark:border-[#2e2218] bg-orange-50/90 dark:bg-[#1a1410] p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-1 text-5xl font-semibold text-orange-950 dark:text-[#f5efe8]">
              {isAdmin ? "Dashboard" : "Welcome to GLE Dashboard"}
            </h1>
            {isAdmin ? (
              <p className="mt-3 max-w-2xl text-slate-600 dark:text-[#a89880]">
                Your learning and platform overview, redesigned with cleaner cards and clearer hierarchy.
              </p>
            ) : (
              <>
                <p className="mt-3 font-medium text-orange-700 dark:text-[#c8b89a]">
                  Your journey to success continues here. Every lesson, every assignment, every certificate brings you closer to where you want to be.
                </p>
                <p className="mt-3 max-w-2xl text-xs text-orange-700 dark:text-[#6b5a46]">
                  "Small steps every day lead to big achievements." Open a course, complete a lesson, or just explore — every action counts. Let's go!
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isEditMode && (
              <Badge className="rounded-full bg-violet-500/10 border border-violet-500/30 px-5 py-2 text-sm font-semibold text-violet-700 dark:bg-amber-500/10 dark:border-amber-400/30 dark:text-amber-200">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Mode Active
              </Badge>
            )}
            {isAdmin && (
              <Badge className="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30">
                Admin View
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-orange-950 dark:text-[#f5efe8]">Platform Overview</h2>
              <p className="text-orange-700 dark:text-orange-500">Real-time platform statistics</p>
            </div>
          </div>

          {adminError && (
            <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 p-5 text-red-700 dark:text-red-400">
              {adminError}
            </div>
          )}

          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <StatCard label="Total Users" value={adminCounts?.total_users ?? "—"} icon={Users} accent="primary" loading={adminLoading} />
            <StatCard label="Total Courses" value={adminCounts?.total_courses ?? "—"} icon={BookOpen} accent="accent" loading={adminLoading} />
            <StatCard label="Total Sales" value={adminCounts?.total_sales ?? "—"} icon={ShoppingCart} accent="success" loading={adminLoading} />
            <StatCard label="Open Tickets" value={adminCounts?.open_tickets ?? "—"} icon={TicketCheck} accent="warn" loading={adminLoading} />
          </div>
        </section>
      )}

      {/* User Stats */}
      {!isAdmin && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-orange-950 dark:text-[#f5efe8]">Your Activity</h2>
              <p className="text-orange-700 dark:text-orange-500">Overview of your learning journey</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
              <StatCard label="Your Programs" value={userDashboard?.webinarsCount ?? 0} icon={BookOpen} accent="accent" loading={userLoading} />
              <StatCard label="Support Messages" value={userDashboard?.supportsCount ?? 0} icon={MessageCircle} accent="primary" loading={userLoading} />
              <StatCard label="Scheduled Meetings" value={userDashboard?.reserveMeetingsCount ?? 0} icon={CalendarCheck2} accent="warn" loading={userLoading} />
              <StatCard label="Comments Posted" value={userDashboard?.commentsCount ?? 0} icon={MessageSquare} accent="primary" loading={userLoading} />
            </div>

            <Card className="rounded-3xl border border-orange-200/80 dark:border-[#2e2218] bg-orange-50/90 dark:bg-[#1a1410] shadow-xl">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700 dark:text-orange-400">Schedule Support</p>
                  <h3 className="mt-3 text-2xl font-semibold text-orange-950 dark:text-[#f5efe8]">Book a 30-minute session</h3>
                  <p className="mt-2 text-sm text-orange-700 dark:text-[#c8b89a]">
                    Connect with our support team to get personalized assistance, answer questions, or review your progress.
                  </p>
                </div>
                <a
                  href="https://calendly.com/globallearnerseducation-support/30min"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex mx-auto rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-center text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition hover:from-orange-700 hover:to-orange-600"
                >
                  Book 30-Minute Support
                </a>
                <p className="text-sm text-orange-700 dark:text-orange-500">
                  Personal assistance for learners — opens in a new tab.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Enrolled Courses */}
      {courses.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-orange-950 dark:text-[#f5efe8]">Enrolled Courses</h2>
                <p className="text-orange-700 dark:text-orange-500">Your active courses and progress</p>
              </div>
            </div>
            <Badge className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/30">
              {courses.length} Course{courses.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group relative min-w-0 overflow-hidden rounded-3xl border border-orange-200/80 dark:border-[#2e2218] bg-orange-50/90 dark:bg-[#1a1410] shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-orange-300 dark:hover:border-[#3d2e1e]"
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

                <CardHeader className="space-y-4 border-b border-orange-200/80 dark:border-[#2e2218] px-7 pb-6 pt-7">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs tracking-widest text-slate-600 dark:text-[#6b5a46]">
                      {course.code}
                    </Badge>
                    <Badge className="rounded-full bg-amber-600 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                      {course.grade ?? "In Progress"}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-semibold leading-tight tracking-tight text-orange-950 dark:text-[#f5efe8]">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-7 px-7 pb-7 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-orange-700 dark:text-orange-500">
                      <span>Progress</span>
                      <span className="font-semibold text-orange-950 dark:text-[#f5efe8]">{course.progress}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-[#0f0d0b]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 transition-all duration-700"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-orange-200/70 dark:border-[#2e2218] bg-orange-50/90 dark:bg-[#0f0d0b] p-5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-orange-700 dark:text-[#6b5a46]">Instructor</span>
                      <span className="font-medium text-orange-950 dark:text-[#f5efe8]">{course.instructor ?? "TBA"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700 dark:text-[#6b5a46]">Next Class</span>
                      <span className="font-medium text-orange-950 dark:text-[#f5efe8]">{course.next_class ?? "Not scheduled"}</span>
                    </div>
                  </div>

                  {!isEditMode ? (
                    <Button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 py-6 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all hover:from-orange-700 hover:to-orange-600"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <PlayCircle className="h-6 w-6" />
                        Continue Learning
                        <ChevronRight className="h-6 w-6 opacity-80" />
                      </div>
                    </Button>
                  ) : (
                    <div className="space-y-4 pt-3">
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
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-orange-950 dark:text-[#f5efe8]">Noticeboard</h2>
                <p className="text-orange-700 dark:text-orange-500">Stay updated with important announcements</p>
              </div>
            </div>
            <Badge className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-lg">
              {userDashboard.unread_noticeboards.length} Unread
            </Badge>
          </div>

          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(340px,1fr))]">
            {userDashboard.unread_noticeboards.map((notice: any) => (
              <Card key={notice.id} className="overflow-hidden rounded-3xl border border-amber-200/70 dark:border-[#2e2218] bg-gradient-to-br from-amber-50 to-white dark:from-[#1a1410] dark:to-[#0f0d0b] shadow-xl">
                <CardContent className="p-8">
                  <h4 className="font-semibold text-xl leading-tight mb-4 text-amber-900 dark:text-amber-100">
                    {notice.title}
                  </h4>
                  <p className="text-slate-600 dark:text-[#a89880] leading-relaxed">{notice.message}</p>
                  {notice.created_at && (
                    <div className="mt-6 flex items-center gap-2 text-xs text-orange-700 dark:text-orange-500">
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