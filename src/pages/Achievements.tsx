import { useMemo, useEffect, useState } from "react";
import { Award, BookOpen, Download, TrendingUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchAchievements } from "@/store/redux/thunks/achievementsThunk";
import CommonTable, { ColumnDef } from "@/components/common/CommonTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthToken } from "@/lib/api";
import { AchievementItem } from "@/store/redux/slices/achievementsSlice";

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
    primary: "bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200/60",
    accent: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/60",
    success: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/60",
    warn: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60",
  };

  const iconBgMap = {
    primary: "bg-white shadow-md shadow-violet-500/20",
    accent: "bg-white shadow-md shadow-blue-500/20",
    success: "bg-white shadow-md shadow-emerald-500/20",
    warn: "bg-white shadow-md shadow-amber-500/20",
  };

  const iconColorMap = {
    primary: "text-violet-600",
    accent: "text-blue-600",
    success: "text-emerald-600",
    warn: "text-amber-600",
  };

  return (
    <Card className={`group relative min-h-[140px] overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 p-0 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${bgMap[accent]}`}>
      <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${accentMap[accent]}`} />
      <CardContent className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.32em] text-slate-500 uppercase">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {loading ? (
                <span className="inline-block h-10 w-20 animate-pulse rounded-2xl bg-slate-200" />
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

export default function Achievements() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.achievements);

  useEffect(() => {
    dispatch(fetchAchievements());
  }, [dispatch]);

  const token = getAuthToken();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const quiz = item.quiz.title?.toLowerCase() ?? "";
      const course = item.webinar.title?.toLowerCase() ?? "";
      const student = item.user.full_name?.toLowerCase() ?? "";
      const instructor = item.quiz.teacher?.full_name?.toLowerCase() ?? "";
      const status = item.status?.toLowerCase() ?? "";

      return (
        quiz.includes(normalizedQuery) ||
        course.includes(normalizedQuery) ||
        student.includes(normalizedQuery) ||
        instructor.includes(normalizedQuery) ||
        status.includes(normalizedQuery)
      );
    });
  }, [items, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredItems]);

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
          <div className="flex flex-nowrap gap-2">
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
    <div className="space-y-6   animate-fade-in">
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
          <StatCard label="Total Achievements" value={stats.total} icon={Award} accent="primary" />
          <StatCard label="Completed" value={stats.completed} icon={Award} accent="accent" />
          <StatCard label="Certificates" value={stats.certificates} icon={BookOpen} accent="success" />
          <StatCard label="Average Score" value={`${stats.averageScore}%`} icon={TrendingUp} accent="warn" />
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
            Showing {filteredItems.length} rows
          </Badge>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Search achievements
            </label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by quiz, course, student, instructor, or status"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <CommonTable
          columns={columns}
          data={paginatedItems}
          loading={loading}
          emptyMessage={error || "No achievements yet."}
          rowKey={(row) => row.id}
        />
        <div className="flex items-center gap-2 p-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            {currentPage} / {pageCount}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
            disabled={currentPage === pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

