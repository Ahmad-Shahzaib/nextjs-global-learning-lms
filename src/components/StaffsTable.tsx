import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchStaffs } from "@/store/redux/thunks/staffsThunk";
import type { Staff } from "@/store/redux/thunks/staffsThunk";
import CommonTable, { ColumnDef } from "@/components/common/CommonTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// ─── Column definitions ────────────────────────────────────────────────────

const COLUMNS: ColumnDef<Staff>[] = [
  {
    header: "#",
    accessor: (_row, idx) => idx + 1,
    className: "w-12 text-center",
  },
  {
    header: "Avatar",
    accessor: (row) => (
      <Avatar className="h-9 w-9">
        <AvatarImage src={row.avatar ?? undefined} alt={row.full_name} />
        <AvatarFallback>
          {row.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
    ),
    className: "w-16",
  },
  {
    header: "Full Name",
    accessor: "full_name",
  },
  {
    header: "Email",
    accessor: "email",
  },
  {
    header: "Mobile",
    accessor: (row) => row.mobile ?? "—",
  },
  {
    header: "Role",
    accessor: (row) => (
      <Badge variant="outline" className="capitalize">
        {row.role_name}
      </Badge>
    ),
  },
  {
    header: "Status",
    accessor: (row) => (
      <Badge
        variant={row.status === "active" ? "default" : "destructive"}
        className="capitalize"
      >
        {row.status}
      </Badge>
    ),
  },
  {
    header: "Joined",
    accessor: (row) =>
      new Date(Number(row.created_at) * 1000).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function StaffsTable() {
  const dispatch = useAppDispatch();
  const { staffs, pagination, loading, error } = useAppSelector(
    (state) => state.staffs
  );

  useEffect(() => {
    dispatch(fetchStaffs());
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(fetchStaffs(page));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Staff Members{" "}
          {pagination && (
            <span className="text-sm font-normal text-muted-foreground">
              ({pagination.total} total)
            </span>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            dispatch(fetchStaffs(pagination?.current_page ?? 1))
          }
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <p className="mb-4 text-sm text-destructive">Error: {error}</p>
        )}

        <CommonTable<Staff>
          columns={COLUMNS}
          data={staffs}
          loading={loading}
          skeletonRows={5}
          emptyMessage="No staff members found."
          rowKey={(row) => row.id}
        />

        {/* Pagination controls */}
        {pagination && pagination.last_page > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {pagination.from}–{pagination.to} of {pagination.total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1 || loading}
                onClick={() => handlePageChange(pagination.current_page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  pagination.current_page === pagination.last_page || loading
                }
                onClick={() => handlePageChange(pagination.current_page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
