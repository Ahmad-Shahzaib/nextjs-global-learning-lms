import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAssignments, fetchAssignmentDetail, sendAssignmentMessage } from "@/store/redux/thunks/assignmentsThunk";
import { clearSelectedAssignment, clearSendMessageStatus } from "@/store/redux/slices/assignmentsSlice";
import { RootState } from "@/store/redux/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import CommonTable, { ColumnDef } from "@/components/common/CommonTable";

type Assignment = {
  id: string | number;
  title?: string;
  webinar_title?: string;
  student?: { full_name?: string };
  user_status?: string;
  deadline?: number;
  used_attempts_count?: number | string;
  attempts?: number | string;
  grade?: number | string | null;
  total_grade?: number | string;
};

const Assignments = () => {
  const dispatch = useDispatch();
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [activeAssignmentId, setActiveAssignmentId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    items,
    loading,
    error,
    selectedAssignment,
    selectedLoading,
    selectedError,
    sendMessageLoading,
    sendMessageError,
    sendMessageSuccess,
  } = useSelector((state: RootState) => state.assignments);


  useEffect(() => {
    dispatch(fetchMyAssignments() as any);
  }, [dispatch]);

  const handleViewDetail = async (id: string | number) => {
    setDetailDialogOpen(true);
    const assignmentId = typeof id === "string" ? Number(id) : id;
    dispatch(fetchAssignmentDetail(assignmentId) as any);
  };

  const closeDetail = () => {
    setDetailDialogOpen(false);
    dispatch(clearSelectedAssignment());
  };

  const openSendDialog = (id: string | number) => {
    const assignmentId = typeof id === "string" ? Number(id) : id;
    setActiveAssignmentId(assignmentId);
    setMessageText("");
    setFile(null);
    dispatch(clearSendMessageStatus());
    setSendDialogOpen(true);
  };

  const closeSendDialog = () => {
    setSendDialogOpen(false);
    setActiveAssignmentId(null);
    setMessageText("");
    setFile(null);
    dispatch(clearSendMessageStatus());
  };

  const handleSendMessage = async () => {
    if (!activeAssignmentId) return;

    if (!messageText.trim()) {
      return;
    }

    await dispatch(
      sendAssignmentMessage({
        assignmentId: activeAssignmentId,
        message: messageText.trim(),
        file,
      }) as any,
    );
  };

  useEffect(() => {
    if (sendMessageSuccess) {
      const timer = window.setTimeout(() => {
        closeSendDialog();
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [sendMessageSuccess]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const webinar = item.webinar_title?.toLowerCase() ?? "";
      const student = item.student?.full_name?.toLowerCase() ?? "";
      const status = item.user_status?.toLowerCase() ?? "";
      return (
        title.includes(normalizedQuery) ||
        webinar.includes(normalizedQuery) ||
        student.includes(normalizedQuery) ||
        status.includes(normalizedQuery)
      );
    });
  }, [items, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredItems]);

  const detailContent = useMemo(() => {
    if (selectedLoading) return "Loading assignment details...";
    if (selectedError) return (
      <p className="text-sm text-destructive">{selectedError}</p>
    );
    if (!selectedAssignment) return (
      <p className="text-sm text-muted-foreground">No assignment selected.</p>
    );

    const deadlineText = selectedAssignment.deadline
      ? new Date(selectedAssignment.deadline * 1000).toLocaleString()
      : "-";

    const formatBadge = (value?: boolean | string | number | null) => {
      if (value === undefined || value === null || value === "") {
        return "-";
      }
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }
      return String(value);
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Assignment Info</h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Title</dt>
                <dd className="text-right text-slate-900">{selectedAssignment.title || "(No title)"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Webinar</dt>
                <dd className="text-right text-slate-900">{selectedAssignment.webinar_title || "-"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Student</dt>
                <dd className="text-right text-slate-900">{selectedAssignment.student?.full_name || "-"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Status</dt>
                <dd>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {selectedAssignment.user_status || "-"}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Deadline</dt>
                <dd className="text-right text-slate-900">{deadlineText}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Progress & Permissions</h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Attempts</dt>
                <dd className="text-right text-slate-900">{selectedAssignment.used_attempts_count ?? 0}/{selectedAssignment.attempts ?? 0}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Grade</dt>
                <dd className="text-right text-slate-900">{selectedAssignment.grade ?? "-"} / {selectedAssignment.total_grade ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Can send message</dt>
                <dd className="text-right text-slate-900">{formatBadge(selectedAssignment.can?.send_message)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="font-medium text-slate-500">Can view error</dt>
                <dd className="text-right text-slate-900">{formatBadge(selectedAssignment.can_view_error)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Description</h3>
          <p className="mt-2 text-sm text-slate-600">{selectedAssignment.description || "No description available."}</p>
        </div>
      </div>
    );
  }, [selectedAssignment, selectedLoading, selectedError]);

  const columns: ColumnDef<Assignment>[] = [
    {
      header: "Title",
      accessor: (row) => row.title || "(No title)",
      className: "font-semibold",
    },
    { header: "Webinar", accessor: (row) => row.webinar_title || "-" },
    { header: "Student", accessor: (row) => row.student?.full_name || "-" },
    { header: "Status", accessor: (row) => row.user_status || "-" },
    {
      header: "Deadline",
      accessor: (row) =>
        row.deadline ? new Date(row.deadline * 1000).toLocaleString() : "-",
    },
    {
      header: "Attempts",
      accessor: (row) => `${row.used_attempts_count ?? 0}/${row.attempts ?? 0}`,
    },
    {
      header: "Grade / Total",
      accessor: (row) => `${row.grade ?? "-"} / ${row.total_grade ?? "-"}`,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex flex-nowrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetail(row.id)}
          >
            View details
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openSendDialog(row.id)}
          >
            Send Assessment
          </Button>
        </div>
      ),
    },

  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <CardTitle>My Assignments</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Search assignments
              </label>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, webinar, student, or status"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none"
              />
            </div>

            {/* <div className="flex items-center justify-between gap-3 text-sm text-slate-600 sm:justify-end">
              <p className="whitespace-nowrap">
                {filteredItems.length} assignment{filteredItems.length === 1 ? "" : "s"} 
              </p>
             
            </div> */}
          </div>

          {error && !loading && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <CommonTable
            columns={columns}
            data={paginatedItems}
            loading={loading}
            emptyMessage={error || "No assignments found."}
            rowKey={(row) => row.id}
            skeletonRows={5}
          />
          
        </CardContent>
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
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              View detailed assignment data.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">{detailContent}</div>

          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeDetail}>
              Close
            </Button>
            <DialogClose asChild>
              <Button onClick={closeDetail}>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Assignment Message</DialogTitle>
            <DialogDescription>
              Send a message related to this assignment with optional file attachment.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {activeAssignmentId ? (
              <p className="text-xs text-muted-foreground">Assignment ID: {activeAssignmentId}</p>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-slate-600">Message</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                rows={4}
                placeholder="Type your message..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600">File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm"
              />
            </div>

            {sendMessageError && (
              <p className="text-sm text-destructive">{sendMessageError}</p>
            )}
            {sendMessageSuccess && (
              <p className="text-sm text-emerald-600">{sendMessageSuccess}</p>
            )}

            <DialogFooter className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={closeSendDialog}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={sendMessageLoading}>
                {sendMessageLoading ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;
