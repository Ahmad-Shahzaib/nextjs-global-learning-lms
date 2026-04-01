import { useEffect } from "react";
import { Award, BookOpen, Download, Loader2 } from "lucide-react";
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

  const getStatusVariant = (status: string) => {
    if (/passed|completed|active/i.test(status)) return "secondary";
    if (/failed|pending|inactive/i.test(status)) return "destructive";
    return "default";
  };

  const token = getAuthToken();

  const columns: ColumnDef<AchievementItem>[] = [
    { header: "ID", accessor: "id" },
    { header: "Quiz", accessor: (item) => item.quiz.title || "—" },
    { header: "Course", accessor: (item) => item.webinar.title || "—" },
    {
      header: "User",
      accessor: (item) => item.user.full_name || "—",
    },
    {
      header: "Educator",
      accessor: (item) => item.quiz.teacher?.full_name ?? item.user.full_name,
    },
    {
      header: "Score",
      accessor: (item) => `${item.user_grade}%`,
    },
    {
      header: "Pass Mark",
      accessor: (item) => `${item.quiz.pass_mark}%`,
    },
    {
      header: "Attempts",
      accessor: (item) => item.quiz.attempt || "—",
    },
    {
      header: "Success Rate",
      accessor: (item) => `${item.quiz.success_rate}%`,
    },
    {
      header: "Status",
      accessor: (item) => (
        <Badge variant={getStatusVariant(item.status)}>
          {item.status?.toUpperCase()}
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
              onClick={() => window.open(item.webinar.link ?? "#", "_blank")}
            >
              <BookOpen className="mr-1 h-3 w-3" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!certificateUrl}
              onClick={() => certificateUrl && window.open(certificateUrl, "_blank")}
            >
              <Download className="mr-1 h-3 w-3" />
              {certificateUrl ? "Download" : "No cert"}
            </Button>
          </div>
        );
      },
    },
    {
      header: "Achieved",
      accessor: (item) => new Date(item.created_at).toLocaleString() || "—",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track awarded quiz certificates and progress for completed course achievements.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1.5">
          Total {items.length} achievements
        </Badge>
      </div>

      {error && !loading && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <CommonTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage={error || "No achievements yet."}
        rowKey={(row) => row.id}
      />
    </div>
  );
}

