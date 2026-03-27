// @ts-nocheck
import { useAuth } from "@/hooks/useAuth";
import { StudentCourseDetail } from "@/components/course/StudentCourseDetail";
import { AdminCourseDetail } from "@/components/course/AdminCourseDetail";

// ─── Root: role-based routing ──────────────────────────────────────────────────
export default function CourseDetail() {
  const { isAdmin, isTeacher, isAccounts } = useAuth();
  const isPrivilegedUser = isAdmin || isTeacher || isAccounts;

  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return isPrivilegedUser ? <AdminCourseDetail /> : <StudentCourseDetail />;
}