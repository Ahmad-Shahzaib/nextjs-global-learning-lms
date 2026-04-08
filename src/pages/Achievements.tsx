import { useMemo, useEffect } from "react";
import { Award, BookOpen, Download } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchAchievements } from "@/store/redux/thunks/achievementsThunk";
import CommonTable, { ColumnDef } from "@/components/common/CommonTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/api";
import { AchievementItem } from "@/store/redux/slices/achievementsSlice";

export default function Achievements() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.achievements);

  useEffect(() => {
    dispatch(fetchAchievements());
  }, [dispatch]);

  const token = getAuthToken();

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => /passed|completed|active/i.test(item.status)).length;
    const certificates = items.filter((item) => item.certificate?.file).length;
    const averageScore = total
      ? Math.round(
          items.reduce((sum, item) => sum + Number(item.user_grade || 0), 0) / total
        )
      : 0;

    return { total, completed, certificates, averageScore };
  }, [items]);

  const getStatusVariant = (status: string) => {
    if (/passed|completed|active/i.test(status)) return "secondary";
    if (/failed|pending|inactive/i.test(status)) return "destructive";
    return "default";
  };

  const columns: ColumnDef<AchievementItem>[] = [
    { header: "ID", accessor: "id", className: "w-[72px]" },
    { header: "Quiz", accessor: (item) => item.quiz.title || "—" },
    { header: "Course", accessor: (item) => item.webinar.title || "—" },
    {
      header: "Student",
      accessor: (item) => item.user.full_name || "—",
    },
    {
      header: "Instructor",
      accessor: (item) => item.quiz.teacher?.full_name ?? item.user.full_name,
    },
    {
      header: "Score",
      accessor: (item) => `${item.user_grade}%`,
    },
    {
      header: "Status",
      accessor: (item) => (
        <Badge variant={getStatusVariant(item.status)} className="uppercase tracking-[0.08em] px-3 py-1.5">
          {item.status || "—"}
        </Badge>
      ),
    },
    {
      header: "Certificate",
      accessor: (item) => {
        const certificateUrl = item.certificate?.file
          ? `${item.certificate.file}${item.certificate.file.includes("?") ? "&" : "?"}token=${token}`
          : undefined;

        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="min-w-[88px]"
              onClick={() => window.open(item.webinar.link ?? "#", "_blank")}
            >
              <BookOpen className="h-4 w-4" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="min-w-[88px]"
              disabled={!certificateUrl}
              onClick={() => certificateUrl && window.open(certificateUrl, "_blank")}
            >
              <Download className="h-4 w-4" />
              {certificateUrl ? "Download" : "No cert"}
            </Button>
          </div>
        );
      },
    },
    {
      header: "Achieved",
      accessor: (item) => new Date(item.created_at).toLocaleString() || "—",
      className: "hidden xl:table-cell",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div className="rounded-[28px] border border-slate-200/70 bg-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Achievement dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Achievements</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review awarded certificates, quiz performance, and student progress across your courses.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-2 text-sm">
            {stats.total} total achievements
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <Award className="h-5 w-5 text-amber-500" />
              <p className="text-sm font-medium">Total Achievements</p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <Award className="h-5 w-5 text-emerald-500" />
              <p className="text-sm font-medium">Completed</p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.completed}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <p className="text-sm font-medium">Certificates</p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.certificates}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <Download className="h-5 w-5 text-violet-500" />
              <p className="text-sm font-medium">Average Score</p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.averageScore}%</p>
          </div>
        </div>
      </div>

      {error && !loading && (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Achievement records</h2>
            <p className="text-sm text-slate-600">Detailed progress for every student achievement entry.</p>
          </div>
          <Badge variant="outline" className="px-3 py-2 text-sm">
            Showing {items.length} rows
          </Badge>
        </div>

        <CommonTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage={error || "No achievements yet."}
          rowKey={(row) => row.id}
        />
      </div>
    </div>
  );
}

