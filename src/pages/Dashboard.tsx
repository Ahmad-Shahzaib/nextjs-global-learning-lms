import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, PlayCircle, CheckCircle2, AlertCircle, Trash2, Copy, Edit2, Users, ShoppingCart, TicketCheck, Wallet, MessageCircle, CalendarCheck2, MessageSquare } from "lucide-react";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import LMSGuides from "@/components/LMSGuides";
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

export default function Dashboard() {
  const { isEditMode, isAdmin, isEditor } = useEditMode();
  const isPrivileged = isAdmin || isEditor;
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { counts: adminCounts, loading: adminLoading, error: adminError } = useAppSelector(
    (state) => state.adminDashboard
  );
  const { data: userDashboard, loading: userLoading, error: userError } = useAppSelector(
    (state) => state.userDashboard
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalActivity: 0,
    inProgress: 0,
    completed: 0,
    totalCourses: 0
  });
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<"assignments" | "quizzes" | null>(null);

  // Fetch admin-only stats from API when user is an admin
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAdminDashboardStats());
    } else if (user) {
      dispatch(fetchUserDashboardInfo());
    }
  }, [isAdmin, user, dispatch]);

  useEffect(() => {
    if (!isAdmin && userDashboard) {
      // Map API response to UI state for user dashboard
      // Courses
      if (Array.isArray(userDashboard.courses)) {
        setCourses(userDashboard.courses);
      }
      // Assignments
      if (Array.isArray(userDashboard.assignments)) {
        setAssignments(userDashboard.assignments);
      }
      // Quizzes
      if (Array.isArray(userDashboard.quizzes)) {
        setQuizzes(userDashboard.quizzes);
      }
      // Stats
      setStats({
        totalActivity: userDashboard.totalActivity ?? 0,
        inProgress: userDashboard.inProgress ?? 0,
        completed: userDashboard.completed ?? 0,
        totalCourses: userDashboard.totalCourses ?? 0,
      });
    }
  }, [isAdmin, userDashboard]);

  const fetchAssignments = async () => {
    // no-op in UI-only mode
    return;
  };

  const fetchQuizzes = async () => {
    // no-op in UI-only mode
    return;
  };

  const updateCourse = async (id: string, field: string, value: any) => {
    // Local-only update (no backend)
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    toast.success("Updated locally (UI-only)");
  };

  const deleteCourse = async (id: string) => {
    // Local-only delete
    setCourses((prev) => prev.filter((c) => c.id !== id));
    toast.success("Removed locally (UI-only)");
  };

  const duplicateCourse = async (course: Course) => {
    const copy: Course = {
      ...course,
      id: `${course.id}-copy-${Date.now()}`,
      title: `${course.title} (Copy)`,
    };
    setCourses((prev) => [copy, ...prev]);
    toast.success("Duplicated locally (UI-only)");
  };

  const renderAssignmentItem = (assignment: any) => (
    <Card key={assignment?.id || assignment?.title} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{assignment.title || "Untitled Assignment"}</h3>
          <p className="text-sm text-muted-foreground">
            Points: {assignment.points ?? "N/A"} · Attempts: {assignment.attempts ?? 0}
          </p>
        </div>
        {assignment.due_date && (
          <span className="text-xs text-muted-foreground">
            Due {new Date(assignment.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </Card>
  );

  const renderQuizItem = (quiz: any) => (
    <Card key={quiz?.id || quiz?.title} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{quiz.title || "Untitled Quiz"}</h3>
          <p className="text-sm text-muted-foreground">Duration: {quiz.duration ?? "N/A"} mins</p>
        </div>
        {quiz.due_date && (
          <span className="text-xs text-muted-foreground">
            Due {new Date(quiz.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeDialog />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {isEditMode && (
          <Badge variant="outline" className="animate-pulse">
            <Edit2 className="h-3 w-3 mr-1" />
            Edit Mode Active
          </Badge>
        )}
      </div>

      {/* Admin-only stats pulled from /v2/admin/dashboard */}
      {isAdmin && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-muted-foreground">Admin Overview</h2>
          {adminError && (
            <p className="text-sm text-destructive">{adminError}</p>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-muted-foreground">Total Users</h3>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-4xl font-bold">
                {adminLoading ? "…" : (adminCounts?.total_users ?? "—")}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-muted-foreground">Total Courses</h3>
                <BookOpen className="h-4 w-4 text-accent" />
              </div>
              <div className="text-4xl font-bold">
                {adminLoading ? "…" : (adminCounts?.total_courses ?? "—")}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-muted-foreground">Total Sales</h3>
                <ShoppingCart className="h-4 w-4 text-success" />
              </div>
              <div className="text-4xl font-bold">
                {adminLoading ? "…" : (adminCounts?.total_sales ?? "—")}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-muted-foreground">Open Tickets</h3>
                <TicketCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="text-4xl font-bold">
                {adminLoading ? "…" : (adminCounts?.open_tickets ?? "—")}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Student / general stats — hidden for admins */}
      {!isAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-muted-foreground">Account Balance</h3>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="text-4xl font-bold">
              {userLoading ? "…" : (userDashboard?.balance ?? 0)}
            </div>
          </Card>
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-muted-foreground">Purchased Courses</h3>
              <BookOpen className="h-4 w-4 text-accent" />
            </div>
            <div className="text-4xl font-bold">
              {userLoading ? "…" : (userDashboard?.webinarsCount ?? 0)}
            </div>
          </Card>
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-muted-foreground">Support Messages</h3>
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="text-4xl font-bold">
              {userLoading ? "…" : (userDashboard?.supportsCount ?? 0)}
            </div>
          </Card>
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-muted-foreground">Meetings</h3>
              <CalendarCheck2 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-4xl font-bold">
              {userLoading ? "…" : (userDashboard?.reserveMeetingsCount ?? 0)}
            </div>
          </Card>
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-muted-foreground">Comments</h3>
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div className="text-4xl font-bold">
              {userLoading ? "…" : (userDashboard?.commentsCount ?? 0)}
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {/* <h2 className="text-2xl font-bold">Enrolled Courses</h2> */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="p-6 hover:shadow-glow transition-all bg-gradient-card group relative">
              {isEditMode && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => duplicateCourse(course)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteCourse(course.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                {isEditMode ? (
                  <>
                    <Input
                      value={course.code}
                      onChange={(e) => updateCourse(course.id, "code", e.target.value)}
                      placeholder="Course Code"
                    />
                    <Input
                      value={course.title}
                      onChange={(e) => updateCourse(course.id, "title", e.target.value)}
                      placeholder="Course Title"
                    />
                    <Input
                      type="number"
                      value={course.progress}
                      onChange={(e) => updateCourse(course.id, "progress", parseInt(e.target.value))}
                      placeholder="Progress %"
                    />
                  </>
                ) : (
                  <>
                    <Badge variant="secondary">{course.code}</Badge>
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">Progress: {course.progress}%</p>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-[#5b3fd6]"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <Button
                      className="w-full bg-gradient-accent"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
      </div>
    </div>
    {/* Noticeboard: show unread_noticeboards as cards */}
    {!isAdmin && (
      <div>
        <h3 className="text-2xl font-bold mb-4">Noticeboard</h3>
        {Array.isArray(userDashboard?.unread_noticeboards) && userDashboard.unread_noticeboards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userDashboard.unread_noticeboards.map((notice: any) => (
              <Card key={notice.id} className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                <h4 className="text-lg font-semibold mb-2">{notice.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">{notice.message}</p>
                {notice.created_at && (
                  <span className="text-xs text-gray-500">{new Date(Number(notice.created_at) * 1000).toLocaleString()}</span>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No unread notices.</p>
        )}
      </div>
    )}

    

    
    </div>
  );
}
