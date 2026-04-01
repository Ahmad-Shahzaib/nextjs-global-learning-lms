import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface Deadline {
  id: string;
  refId: string;
  title: string;
  course: string;
  courseId: string;
  due_date: string;
  priority: string;
  hours_left: number;
  type: "assignment" | "quiz";
}

const isLikelyUuid = (value?: string) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

const parseDeadline = (value?: string | null) => {
  if (!value) return null;
  let trimmed = String(value).trim();
  if (!trimmed) return null;
  trimmed = trimmed.replace(/\.\d+/, "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const dateOnly = new Date(`${trimmed}T23:59:59`);
    return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
  }
  const normalized = trimmed.includes(" ")
    ? trimmed.replace(" ", "T")
    : trimmed;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildDeadline = (item: any, type: "assignment" | "quiz") => {
  const deadline = item.custom_deadline || item.due_date;
  if (!deadline) return null;
  const dueDate = parseDeadline(deadline);
  const now = new Date();
  if (dueDate && dueDate.getTime() < now.getTime()) return null;
  const hoursLeft = dueDate
    ? Math.max(0, Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)))
    : 0;
  const courseId = item.course_id || (isLikelyUuid(item.course) ? item.course : "");
  const courseLabel = item.course_title || item.course_code || item.course || item.course_id || "";
  return {
    id: `${type}-${item.id}`,
    refId: item.id,
    title: item.title,
    course: courseLabel,
    courseId,
    due_date: deadline,
    priority:
      type === "quiz"
        ? hoursLeft < 24
          ? "high"
          : hoursLeft < 72
            ? "medium"
            : "low"
        : item.priority || "medium",
    hours_left: hoursLeft,
    type,           
  };
};

const normalizeApiList = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.assignments)) return value.assignments;
    if (Array.isArray(value.quizzes)) return value.quizzes;
  }
  return [];
};

const dedupeDeadlines = (items: Deadline[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.type}-${item.refId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export function RightSidebar() {
  const { user, isAdmin, isAccounts, isTeacher } = useAuth();
  const isPrivileged = useMemo(() => isAdmin || isAccounts || isTeacher, [isAdmin, isAccounts, isTeacher]);

  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions", user?.id],
    queryFn: () => apiFetch<any[]>("/submissions?mine=true"),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: progressItems = [] } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: () => apiFetch<any[]>("/progress"),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: () => apiFetch<any[]>("/enrollments"),
    enabled: !!user && !isPrivileged,
    staleTime: 10 * 60 * 1000,
  });

  const { data: feedData } = useQuery({
    queryKey: ["feedUpcoming", user?.id],
    queryFn: () => apiFetch<any>("/feed/upcoming"),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignmentsList", user?.id],
    queryFn: () => apiFetch<any>("/assignments"),
    enabled: !!user && !isPrivileged,
    staleTime: 5 * 60 * 1000,
  });

  const deadlines = useMemo(() => {
    if (!user) return [];
    
    const submissionsArray = Array.isArray(submissions) ? submissions : (submissions as any)?.data || [];
    const progressArray = Array.isArray(progressItems) ? progressItems : (progressItems as any)?.data || [];
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : (enrollments as any)?.data || [];

    const submittedIds = new Set(submissionsArray.map((s: any) => s.assignment_id).filter(Boolean));
    const startedQuizzes = new Set(
      progressArray
        .filter((p: any) => p.item_type === "quiz" && p.quiz_id)
        .map((p: any) => p.quiz_id)
    );
    const courseIds = new Set(
      enrollmentsArray
        .filter((e: any) => !e.status || e.status === "active")
        .map((e: any) => e.course_id)
        .filter(Boolean)
    );

    const shouldFilterByCourse = !isPrivileged && courseIds.size > 0;
    const assignmentsSourceRaw = isPrivileged ? feedData?.assignments || [] : assignments;
    const quizzesSourceRaw = feedData?.quizzes || [];

    const assignmentsSource = normalizeApiList(assignmentsSourceRaw);
    const quizzesSource = normalizeApiList(quizzesSourceRaw);

    const assignmentDeadlines = assignmentsSource
      .map((a) => buildDeadline(a, "assignment"))
      .filter((d): d is Deadline => Boolean(d))
      .filter((d) => !submittedIds.has(d.refId))
      .filter((d) => !shouldFilterByCourse || !d.courseId || courseIds.has(d.courseId));

    const quizDeadlines = (quizzesSource || [])
      .map((q) => buildDeadline(q, "quiz"))
      .filter((d): d is Deadline => Boolean(d))
      .filter((d) => !startedQuizzes.has(d.refId));

    return dedupeDeadlines([...assignmentDeadlines, ...quizDeadlines]).sort((a, b) => {
      const aTime = parseDeadline(a.due_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = parseDeadline(b.due_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  }, [user, feedData, assignments, submissions, progressItems, enrollments, isPrivileged]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {deadlines.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground">
                <p className="text-sm">No upcoming deadlines</p>
              </Card>
            ) : (
              deadlines.map((deadline) => (
                <Card
                  key={deadline.id}
                  className={cn(
                    "p-4 border-l-4 transition-all duration-300 hover:shadow-glow hover:scale-105 bg-gradient-card",
                    deadline.priority === "high" && "border-l-destructive shadow-glow-accent",
                    deadline.priority === "medium" && "border-l-warning",
                    deadline.priority === "low" && "border-l-success"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {deadline.type === "quiz" && (
                          <Badge variant="secondary" className="text-[10px] h-5 bg-purple-600 text-white mb-1">
                            Quiz
                          </Badge>
                        )}
                        {deadline.type === "assignment" && (
                          <Badge variant="destructive" className="text-[10px] h-5 mb-1">
                            Assignment
                          </Badge>
                        )}
                        <h3 className="font-medium text-sm leading-tight">{deadline.title}</h3>
                      </div>
                      <Badge
                        variant={deadline.priority === "high" ? "destructive" : "secondary"}
                        className={deadline.priority === "high" ? "animate-pulse" : ""}
                      >
                        {deadline.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{deadline.course}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {deadline.due_date
                          ? (() => {
                              const parsed = parseDeadline(deadline.due_date);
                              if (!parsed) return "No date";
                              const uaeDate = new Date(parsed.getTime() + 4 * 60 * 60 * 1000);
                              return format(uaeDate, "MMM d, h:mm a");
                            })()
                          : "No date"}
                      </span>
                      <span
                        className={cn(
                          "ml-auto font-semibold",
                          deadline.hours_left < 24 && "text-destructive",
                          deadline.hours_left >= 24 && deadline.hours_left < 72 && "text-warning",
                          deadline.hours_left >= 72 && "text-success"
                        )}
                      >
                        {deadline.hours_left}h left
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
