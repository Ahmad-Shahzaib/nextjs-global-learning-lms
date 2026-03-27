import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchStudents } from "@/store/redux/thunks/studentsThunk";
import type { Student } from "@/store/redux/thunks/studentsThunk";
import CommonTable, { type ColumnDef } from "@/components/common/CommonTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, X } from "lucide-react";

const COLUMNS: ColumnDef<Student>[] = [
  {
    header: "#",
    accessor: (_row, idx) => idx + 1,
    className: "w-10 text-center text-muted-foreground",
  },
  {
    header: "Student",
    accessor: (s) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={s.avatar ?? undefined} alt={s.full_name ?? ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {s.full_name
              ? s.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium leading-tight">
            {s.full_name ?? <span className="text-muted-foreground italic">No name</span>}
          </p>
          <p className="text-xs text-muted-foreground">{s.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Mobile",
    accessor: (s) => s.mobile ?? "—",
    className: "text-muted-foreground",
  },
  {
    header: "Role",
    accessor: (s) => (
      <Badge variant="outline" className="capitalize">
        {s.role_name}
      </Badge>
    ),
    className: "w-24",
  },
  {
    header: "Status",
    accessor: (s) => (
      <Badge
        variant={s.status === "active" ? "default" : "secondary"}
        className="capitalize"
      >
        {s.status}
      </Badge>
    ),
    className: "w-28",
  },
  {
    header: "Joined",
    accessor: (s) =>
      new Date(Number(s.created_at) * 1000).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    className: "w-32 text-muted-foreground",
  },
];

export default function Studentlist() {
  const dispatch = useAppDispatch();
  const { students, pagination, loading, error } = useAppSelector(
    (state) => state.students
  );

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchStudents(1));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(fetchStudents(page));
    setSearchQuery("");
    setSearchInput("");
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        (s.full_name ?? "").toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.mobile ?? "").toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
          Students
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage all registered students
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
          <CardTitle className="text-lg font-semibold">
            Student List{" "}
            {pagination && (
              <span className="text-sm font-normal text-muted-foreground">
                ({pagination.total} total)
              </span>
            )}
          </CardTitle>

          <div className="flex flex-wrap gap-2 items-center">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearchQuery(searchInput.trim())}
              placeholder="Search by name, email or mobile"
              className="w-64"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery(searchInput.trim())}
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchStudents(pagination?.current_page ?? 1))}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">Error: {error}</p>
          )}

          <CommonTable<Student>
            columns={COLUMNS}
            data={filteredStudents}
            loading={loading}
            skeletonRows={10}
            emptyMessage="No students found."
            rowKey={(s) => s.id}
          />

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && !searchQuery && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {pagination.from}–{pagination.to} of {pagination.total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === 1 || loading}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                >
                  Previous
                </Button>
                <span className="px-2">
                  Page {pagination.current_page} / {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === pagination.last_page || loading}
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
