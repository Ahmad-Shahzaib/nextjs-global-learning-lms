// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Download, LayoutGrid, ClipboardList, Award, ChevronDown, ChevronRight,
  FileText, FileQuestion, Menu, UserPlus, Trash2, Plus, File, Video,
  Upload, BookOpen, Presentation, Loader2, Edit2, Check, X, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RichTextEditor } from "@/components/RichTextEditor";
import { DraggableMaterialList, DraggableAssignmentList, DraggableQuizList } from "@/components/DraggableMaterialList";
import { CertificateGeneratedDialog } from "@/components/CertificateGeneratedDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { apiFetch, resolveStorageUrl, ApiError } from "@/lib/api";
import { chunkedUploadFile } from "@/lib/chunkUpload";
import { directUploadFile } from "@/lib/directUpload";

// ─── Admin View ────────────────────────────────────────────────────────────────
export function AdminCourseDetail() {
  const { courseId } = useParams();
  const { user, isAdmin: isAdminFromAuth, isTeacher, isAccounts } = useAuth();
  const canManageUsers = isAdminFromAuth || isAccounts;

  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [editingSectionSaving, setEditingSectionSaving] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [currentSectionId, setCurrentSectionId] = useState("");
  const [newSection, setNewSection] = useState({ title: "", description: "" });
  const getDefaultAssignmentState = () => ({ title: "", unit_name: "", description: "", points: 100, passing_marks: 50, assessment_brief: "", due_date: "" });
  const [newAssignment, setNewAssignment] = useState(getDefaultAssignmentState());
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [sectionQuizzes, setSectionQuizzes] = useState<any[]>([]);
  const [newQuiz, setNewQuiz] = useState({ title: "", quiz_url: "", description: "", duration: 30, due_date: "" });
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState<string | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [fileDisplayName, setFileDisplayName] = useState("");
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");
  const [googleDriveTitle, setGoogleDriveTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pptTitle, setPptTitle] = useState("");
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pptUploading, setPptUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [activeUploadMode, setActiveUploadMode] = useState<"direct" | "chunked" | null>(null);
  const [newTextLesson, setNewTextLesson] = useState({ title: "", content: "" });
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
  const [selectedAssignmentForDeadline, setSelectedAssignmentForDeadline] = useState<any>(null);
  const [selectedQuizForDeadline, setSelectedQuizForDeadline] = useState<any>(null);
  const [selectedUserForDeadline, setSelectedUserForDeadline] = useState("");
  const [customDeadline, setCustomDeadline] = useState("");
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [assignmentSectionContext, setAssignmentSectionContext] = useState<any>(null);
  const [defaultSectionId, setDefaultSectionId] = useState("default-section");
  const [defaultSectionSlug, setDefaultSectionSlug] = useState("default-section");
  const MATERIAL_UPLOAD_TIMEOUT = 600000;

  const isActivityDialogBusy = activityLoading || pdfUploading || pptUploading;
  const activityLabelMap: Record<string, string> = { text: "text lesson", file: "file", pdf: "PDF", powerpoint: "PowerPoint", brief: "assessment brief", quiz: "quiz", google_drive: "Google Drive item", video_lecture: "video lecture", assignment: "assignment" };
  const activityOverlayLabel = pdfUploading ? "Uploading PDF..." : pptUploading ? "Uploading PowerPoint..." : activityType ? `Adding ${activityLabelMap[activityType] || "activity"}...` : "Adding activity...";

  // Helpers
  const keyify = (val: any) => (val === undefined || val === null ? "" : String(val));
  const normalizeIdentifier = (value: any) => { if (value === undefined || value === null) return ""; return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); };
  const generateSectionSlug = (section: any, fallbackIndex: number) => { const candidate = section?.slug || section?.title || section?.name || section?.id || `section-${fallbackIndex}`; return normalizeIdentifier(candidate) || `section-${fallbackIndex}`; };
  const getSectionKey = (section: any) => keyify(section?.id || section?.section_id || section?.sectionId || section?.unit_id || section?.unitId || section?.title || section?.name);
  const getItemSectionKey = (item: any) => keyify(item?.section_id || item?.section || item?.sectionId || item?.unit_id || item?.unitId || item?.unit_name || item?.unitName || item?.section_name || item?.sectionName);
  const getActiveSectionId = () => currentSectionId || defaultSectionId;
  const resolveSectionContext = (section?: any) => { const fallbackId = defaultSectionId || "default-section"; const candidateId = section?.id || section?.section_id || section?.title || fallbackId; const normalizedSlug = section?.slug || normalizeIdentifier(section?.title) || normalizeIdentifier(candidateId); return { id: keyify(candidateId) || fallbackId, slug: normalizedSlug || "default-section" }; };
  const mapSectionToDialogContext = (section: any) => { const candidateSection = section || sections[0] || { id: defaultSectionId, title: "Course Section" }; const context = resolveSectionContext(candidateSection); const title = candidateSection?.title || "Course Section"; return { ...context, title }; };
  const getNextMaterialOrderIndex = (sectionId?: string) => { const orderingKey = keyify(sectionId || getActiveSectionId() || defaultSectionId); let maxIndex = -1; materials.forEach((item) => { const itemKey = getItemSectionKey(item) || defaultSectionId; if (itemKey !== orderingKey) return; const currentIndex = Number(item?.order_index ?? 0); if (Number.isFinite(currentIndex) && currentIndex > maxIndex) maxIndex = currentIndex; }); return (maxIndex + 1).toString(); };
  const getAssignmentDialogSectionContext = () => { const candidateSection = sections.find(s => s.id === currentSectionId) || sections[0] || { id: defaultSectionId, slug: defaultSectionSlug, title: "Course Section" }; const resolvedContext = resolveSectionContext(candidateSection); const title = candidateSection?.title || "Course Section"; return { ...resolvedContext, title }; };
  const resolveUserSelectionId = (u: any) => u?.user_id ?? u?.id ?? "";
  const mergeUsers = (enrolled: any[], all: any[]) => { const seen = new Set<string>(); const merged: any[] = []; const addUser = (entry: any) => { const id = resolveUserSelectionId(entry); if (!id || seen.has(id)) return; seen.add(id); merged.push(entry); }; enrolled.forEach(addUser); all.forEach(addUser); return merged; };
  const mergedUserOptions = mergeUsers(enrolledStudents, users);
  const deadlineUserOptions = mergedUserOptions.map((candidate) => ({ selectionId: resolveUserSelectionId(candidate), user: candidate })).filter((entry) => entry.selectionId);
  const getDefaultDeadlineUser = (options?: any[]) => { const list = options ?? mergedUserOptions; if (list?.length) { const selectionId = resolveUserSelectionId(list[0]); if (selectionId) return selectionId; } return user?.id || ""; };
  const formatDateForInput = (value?: string | null) => { if (!value) return ""; const date = new Date(value); const tzAdjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return tzAdjusted.toISOString().slice(0, 16); };

  const doesAssignmentBelongToSection = (assignment: any, section: any) => {
    if (!assignment || !section) return false;
    const sectionId = getSectionKey(section);
    const assignmentSection = getItemSectionKey(assignment);
    return assignmentSection === sectionId || normalizeIdentifier(assignment.unit_name) === normalizeIdentifier(section.title) || normalizeIdentifier(assignment.unit_name) === normalizeIdentifier(section.slug);
  };

  const sectionSensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => { if (user) { loadCourseData(); } }, [user, courseId]);
  useEffect(() => { if (!activityDialogOpen) setCurrentSectionId(""); }, [activityDialogOpen]);
  useEffect(() => { if (!assignmentDialogOpen) { setNewAssignment(getDefaultAssignmentState()); setAssignmentFile(null); setAssignmentSectionContext(null); } }, [assignmentDialogOpen]);

  const loadCourseData = async () => {
    if (!courseId) return;
    try {
      let data = await apiFetch<any>(`/v2/panel/webinars/${courseId}`);
      if (data && typeof data === "object" && "success" in data) {
        if (!data.success) {
          throw new Error(data.message || "Failed to load webinar");
        }
        data = Array.isArray(data.data) ? data.data[0] || null : data.data;
      }
      setCourse(data);
      const sectionsRaw = data.sections || data.course_sections || data.chapters || [];
      let normalizedSections = sectionsRaw.map((s: any, idx: number) => {
        const originalId = keyify(s?.id || s?.section_id || `section-${idx}`);
        const title = s?.title || s?.name || s?.translations?.[0]?.title || "Untitled Section";
        const slug = generateSectionSlug(s, idx);
        return { ...s, id: originalId, slug, title };
      });
      if (!normalizedSections.length) normalizedSections = [{ id: "default-section", slug: "default-section", title: "Course Content" }];
      const defaultId = normalizedSections[0]?.id || "default-section";
      const defaultSlug = normalizedSections[0]?.slug || "default-section";
      setDefaultSectionId(defaultId);
      setDefaultSectionSlug(defaultSlug);
      setSections(normalizedSections);
      const materialList = [...(data.materials || []), ...sectionsRaw.flatMap((s: any) => (s.materials || []).map((m: any) => ({ ...m, section_id: keyify(m.section_id || s.id || s.title) })))];
      const assignmentList = [...(data.assignments || []), ...sectionsRaw.flatMap((s: any) => (s.assignments || []).map((a: any) => ({ ...a, unit_name: keyify(a.unit_name || s.id || s.title), _isAssignment: true, course_id: courseId })))];
      const quizList = [...(data.quizzes || []), ...sectionsRaw.flatMap((s: any) => (s.quizzes || []).map((q: any) => ({ ...q, section_id: keyify(q.section_id || s.id || s.title), _isQuiz: true })))];
      setMaterials(materialList.map(m => ({ ...m, file_path: m.file_path || m.link_url || m.url || "", section_id: getItemSectionKey(m) || defaultId, title: m.title || m.name || "Untitled" })));
      setAssignments(assignmentList.map(a => ({ ...a, unit_name: getItemSectionKey(a) || defaultId, title: a.title || "Untitled", file_type: "assignment", _isAssignment: true, course_id: courseId })));
      setSectionQuizzes(quizList.map(q => ({ ...q, section_id: getItemSectionKey(q) || defaultId, title: q.title || "Quiz", file_type: "quiz", _isQuiz: true })));
      setEnrolledStudents(data.enrollments || []);
      if (canManageUsers) { try { const usersData = await apiFetch<any[]>("/users"); setUsers(usersData); } catch (e) { console.error(e); } }
    } catch (error: any) {
      toast.error(error.message || "Failed to load course");
      setCourse({ title: "Course not found", code: "", category: "" });
    }
  };

  const uploadMaterialFile = async (file: File, title: string, sectionId: string, options: any = {}) => {
    setUploadProgress(null); setActiveUploadMode(null);
    let uploadResult;
    try {
      try { uploadResult = await directUploadFile(file, { signal: options.signal, onProgress: (p: any) => { setActiveUploadMode("direct"); setUploadProgress(p.percent); } }); }
      catch { uploadResult = await chunkedUploadFile(file, { signal: options.signal, onProgress: (p: any) => { setActiveUploadMode("chunked"); setUploadProgress(Math.round((p.uploadedChunks / Math.max(1, p.totalChunks)) * 100)); } }); }
      const payload = new FormData();
      payload.append("course_id", courseId || "");
      payload.append("section_id", sectionId);
      payload.append("title", title);
      payload.append("order_index", options.orderIndex ?? getNextMaterialOrderIndex(sectionId));
      payload.append("uploaded_file_id", uploadResult.fileIdentifier);
      payload.append("uploaded_file_size", uploadResult.size.toString());
      payload.append("uploaded_file_mime_type", uploadResult.mimeType);
      if (options.description) payload.append("description", options.description);
      if (options.extraFields) Object.entries(options.extraFields).forEach(([k, v]: any) => payload.append(k, v));
      await apiFetch("/materials", { method: "POST", body: payload, timeoutMs: MATERIAL_UPLOAD_TIMEOUT });
    } finally { setUploadProgress(null); setActiveUploadMode(null); }
  };

  const handleEnrollUser = async () => { if (!selectedUserId || !courseId) return; try { await apiFetch("/enrollments", { method: "POST", body: { user_id: selectedUserId, course_id: courseId, role: "student" } }); toast.success("User enrolled successfully"); setEnrollDialogOpen(false); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed to enroll user"); } };
  const handleDeleteCourse = async () => { if (!courseId || !confirm("Are you sure?")) return; try { await apiFetch(`/courses/${courseId}`, { method: "DELETE" }); toast.success("Course deleted"); window.location.href = "/courses"; } catch (error: any) { toast.error(error.message); } };
  const handleAddSection = async () => { if (!newSection.title || !courseId) return; try { await apiFetch("/sections", { method: "POST", body: { course_id: courseId, title: newSection.title, description: newSection.description, order_index: sections.length } }); toast.success("Section added"); setSectionDialogOpen(false); setNewSection({ title: "", description: "" }); loadCourseData(); } catch (error: any) { toast.error(error.message); } };
  const handleDeleteSection = async (sectionId: string) => { if (!courseId || !sectionId || !confirm("Delete this section?")) return; try { await apiFetch(`/sections/${sectionId}`, { method: "DELETE" }); toast.success("Section deleted"); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed to delete section"); } };
  const startEditingSection = (section: any) => { setEditingSectionId(section.id); setEditingSectionTitle(section.title || ""); };
  const cancelEditingSection = () => { setEditingSectionId(null); setEditingSectionTitle(""); };
  const saveSectionTitle = async (sectionId: string) => { if (!editingSectionTitle.trim()) { toast.error("Section title cannot be empty"); return; } setEditingSectionSaving(true); try { await apiFetch(`/sections/${sectionId}`, { method: "PATCH", body: { title: editingSectionTitle.trim() } }); setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title: editingSectionTitle.trim() } : s)); toast.success("Section title updated"); cancelEditingSection(); } catch (error: any) { toast.error(error.message || "Failed"); } finally { setEditingSectionSaving(false); } };
  const handleAddTextLesson = async () => { const sectionId = currentSectionId || getActiveSectionId(); if (!newTextLesson.title || !newTextLesson.content || !sectionId || !courseId) { toast.error("Please provide title, content, and section"); return; } setActivityLoading(true); try { const fd = new FormData(); fd.append("course_id", courseId); fd.append("section_id", sectionId); fd.append("title", newTextLesson.title); fd.append("content", newTextLesson.content); fd.append("order_index", getNextMaterialOrderIndex(sectionId)); await apiFetch("/materials", { method: "POST", body: fd, timeoutMs: 600000 }); toast.success("Activity added successfully"); setActivityDialogOpen(false); setNewTextLesson({ title: "", content: "" }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } finally { setActivityLoading(false); } };
  const handleUploadMaterials = async () => { const sectionId = getActiveSectionId(); if (!uploadFiles.length || !fileDisplayName || !sectionId) { toast.error("Please provide a display name"); return; } setActivityLoading(true); try { let next = Number(getNextMaterialOrderIndex(sectionId)); for (const file of uploadFiles) { await uploadMaterialFile(file, fileDisplayName, sectionId, { orderIndex: next.toString() }); next++; } toast.success("Activity added successfully"); setUploadFiles([]); setFileDisplayName(""); setActivityDialogOpen(false); setActivityType(null); loadCourseData(); } catch (error: any) { toast.error(error.message); } finally { setActivityLoading(false); } };
  const handleAddPdf = async () => { const sectionId = getActiveSectionId(); if (!pdfFile || !pdfTitle || !sectionId || !courseId) { toast.error("Please provide a title and PDF"); return; } try { setPdfUploading(true); await uploadMaterialFile(pdfFile, pdfTitle, sectionId, { orderIndex: getNextMaterialOrderIndex(sectionId), extraFields: { file_type: "pdf" } }); toast.success("Activity added successfully"); setPdfTitle(""); setPdfFile(null); setActivityDialogOpen(false); setActivityType(null); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } finally { setPdfUploading(false); } };
  const handleAddPowerPoint = async () => { const sectionId = getActiveSectionId(); if (!pptFile || !pptTitle || !sectionId || !courseId) { toast.error("Please provide a title and PowerPoint file"); return; } try { setPptUploading(true); await uploadMaterialFile(pptFile, pptTitle, sectionId, { orderIndex: getNextMaterialOrderIndex(sectionId), extraFields: { file_type: "presentation" } }); toast.success("Activity added successfully"); setPptTitle(""); setPptFile(null); setActivityDialogOpen(false); setActivityType(null); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } finally { setPptUploading(false); } };
  const handleAddVideoLecture = async () => { const sectionId = getActiveSectionId(); if (!videoFile || !videoTitle || !sectionId || !courseId) { toast.error("Please provide title and video file"); return; } setActivityLoading(true); try { await uploadMaterialFile(videoFile, videoTitle, sectionId, { description: videoTitle }); toast.success("Activity added successfully"); setVideoTitle(""); setVideoFile(null); setActivityDialogOpen(false); setActivityType(null); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } finally { setActivityLoading(false); } };
  const handleAddAssessmentBrief = async () => { const sectionId = getActiveSectionId(); if (!newAssignment.title || !sectionId || !courseId) { toast.error("Title and section are required"); return; } if (!assignmentFile && !newAssignment.assessment_brief) { toast.error("Please upload a file or enter brief content"); return; } setActivityLoading(true); try { if (assignmentFile) { await uploadMaterialFile(assignmentFile, `${newAssignment.title} - Brief`, sectionId, { orderIndex: getNextMaterialOrderIndex(sectionId) }); } else { const briefFile = new File([newAssignment.assessment_brief], `${newAssignment.title}.txt`, { type: "text/plain" }); await uploadMaterialFile(briefFile, `${newAssignment.title} - Brief`, sectionId, { orderIndex: getNextMaterialOrderIndex(sectionId) }); } toast.success("Activity added successfully"); setNewAssignment(getDefaultAssignmentState()); setAssignmentFile(null); setActivityDialogOpen(false); setActivityType(null); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } finally { setActivityLoading(false); } };
  const handleAddGoogleDrive = async () => { const sectionId = getActiveSectionId(); if (!googleDriveUrl || !googleDriveTitle || !sectionId || !courseId) { toast.error("Please provide title and URL"); return; } setActivityLoading(true); try { const fd = new FormData(); fd.append("course_id", courseId); fd.append("section_id", sectionId); fd.append("title", googleDriveTitle.trim()); fd.append("link_url", googleDriveUrl); fd.append("file_type", "google_drive"); fd.append("order_index", getNextMaterialOrderIndex(sectionId)); await apiFetch("/materials", { method: "POST", body: fd }); toast.success("Activity added successfully"); setGoogleDriveUrl(""); setGoogleDriveTitle(""); setActivityDialogOpen(false); setActivityType(null); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } finally { setActivityLoading(false); } };
  const handleAddQuiz = async () => { const targetSectionId = currentSectionId || getActiveSectionId(); if (!newQuiz.title || !newQuiz.quiz_url || !targetSectionId || !courseId) { toast.error("Please provide title, URL, and section"); return; } setActivityLoading(true); try { await apiFetch("/quizzes", { method: "POST", body: { course_id: courseId, section_id: targetSectionId, title: newQuiz.title, quiz_url: newQuiz.quiz_url, description: newQuiz.description, duration: newQuiz.duration, due_date: newQuiz.due_date || null } }); toast.success("Activity added successfully"); setActivityDialogOpen(false); setActivityType(null); setNewQuiz({ title: "", quiz_url: "", description: "", duration: 30, due_date: "" }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } finally { setActivityLoading(false); } };
  const handleAddAssignment = async () => { const sectionContext = assignmentSectionContext || getAssignmentDialogSectionContext(); if (!newAssignment.title || !courseId || !sectionContext.id) { toast.error("Title, course, and section are required"); return; } setActivityLoading(true); try { await apiFetch("/assignments", { method: "POST", body: { title: newAssignment.title.trim(), course: courseId, unit_name: newAssignment.unit_name || sectionContext.slug, points: Number(newAssignment.points || 100), passing_marks: Number(newAssignment.passing_marks || 50), description: newAssignment.description || "", assessment_brief: newAssignment.assessment_brief || "", priority: "medium", attempts: 2, section_id: sectionContext.id, due_date: newAssignment.due_date || null } }); if (assignmentFile) await uploadMaterialFile(assignmentFile, `${newAssignment.title} - Brief`, sectionContext.id, { orderIndex: getNextMaterialOrderIndex(sectionContext.id) }); toast.success("Assignment added successfully"); setAssignmentDialogOpen(false); setNewAssignment(getDefaultAssignmentState()); setAssignmentFile(null); setAssignmentSectionContext(null); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed to add assignment"); } finally { setActivityLoading(false); } };
  const handleSetUserDeadline = async () => { if (!customDeadline) { toast.error("Please set a deadline"); return; } try { if (selectedAssignmentForDeadline) { await apiFetch(`/assignments/${selectedAssignmentForDeadline.id}/deadline`, { method: "POST", body: { user_id: selectedUserForDeadline || getDefaultDeadlineUser(), deadline: customDeadline } }); toast.success("Assignment deadline set"); } else if (selectedQuizForDeadline) { await apiFetch(`/quizzes/${selectedQuizForDeadline.id}/deadline`, { method: "POST", body: { user_id: selectedUserForDeadline || user?.id, deadline: customDeadline } }); toast.success("Quiz deadline set"); } setDeadlineDialogOpen(false); setSelectedAssignmentForDeadline(null); setSelectedQuizForDeadline(null); setSelectedUserForDeadline(""); setCustomDeadline(""); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed to set deadline"); } };
  const ensureUsersLoaded = async () => { let merged = mergeUsers(enrolledStudents, users); if (merged.length > 0 || !canManageUsers) return merged; try { const data = await apiFetch<any[]>("/users"); setUsers(data || []); merged = mergeUsers(enrolledStudents, data || []); } catch (e) { console.error(e); } return merged; };
  const openAssignmentDeadlineDialog = async (assignment: any) => { const options = await ensureUsersLoaded(); setSelectedAssignmentForDeadline(assignment); setSelectedQuizForDeadline(null); setSelectedUserForDeadline(getDefaultDeadlineUser(options)); setCustomDeadline(formatDateForInput(assignment?.due_date)); setDeadlineDialogOpen(true); };
  const openQuizDeadlineDialog = async (quiz: any) => { const options = await ensureUsersLoaded(); setSelectedQuizForDeadline(quiz); setSelectedAssignmentForDeadline(null); setSelectedUserForDeadline(getDefaultDeadlineUser(options)); setCustomDeadline(formatDateForInput(quiz?.due_date)); setDeadlineDialogOpen(true); };
  const handleSectionDragEnd = async (event: any) => { const { active, over } = event; if (!over || active.id === over.id) return; const oldIndex = sections.findIndex(s => s.id === active.id); const newIndex = sections.findIndex(s => s.id === over.id); if (oldIndex < 0 || newIndex < 0) return; const prev = sections; const reordered = arrayMove(sections, oldIndex, newIndex); setSections(reordered); try { await apiFetch("/sections/reorder", { method: "POST", body: { order: reordered.map(s => s.id) } }); } catch (error: any) { setSections(prev); toast.error(error?.message || "Failed to reorder"); } };

  const SortableSectionCard = ({ section }: { section: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
    const isEditingSection = editingSectionId === section.id;
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
    return (
      <div ref={setNodeRef} style={style}>
        <Card className="shadow-sm border border-border">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground" type="button"><GripVertical className="h-4 w-4" /></button>
                <CardTitle className="text-base sm:text-lg break-words">
                  {isEditingSection ? <Input value={editingSectionTitle} onChange={e => setEditingSectionTitle(e.target.value)} className="w-full sm:w-[220px]" /> : section.title}
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isEditingSection ? (
                  <>
                    <Button size="sm" onClick={() => saveSectionTitle(section.id)} disabled={editingSectionSaving} className="gap-2 w-full sm:w-auto">{editingSectionSaving ? <><Loader2 className="h-3 w-3 animate-spin" />Saving...</> : <><Check className="h-3 w-3" />Save</>}</Button>
                    <Button size="sm" variant="outline" onClick={cancelEditingSection} className="gap-1 w-full sm:w-auto"><X className="h-3 w-3" />Cancel</Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => startEditingSection(section)} className="gap-2 w-full sm:w-auto"><Edit2 className="h-3 w-3" />Rename</Button>
                )}
                <Button size="sm" onClick={() => { const ctx = resolveSectionContext(section); setCurrentSectionId(ctx.id); setActivityDialogOpen(true); }} className="gap-2 w-full sm:w-auto"><Plus className="h-4 w-4" />Add an activity</Button>
                <Button size="sm" variant="outline" onClick={() => { const ctx = mapSectionToDialogContext(section); setAssignmentSectionContext(ctx); setCurrentSectionId(ctx.id); setAssignmentDialogOpen(true); }} className="gap-2 w-full sm:w-auto"><Upload className="h-4 w-4" />Add assignment</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteSection(section.id || defaultSectionId)} className="gap-2 text-destructive w-full sm:w-auto"><Trash2 className="h-4 w-4" />Delete section</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DraggableMaterialList
              materials={materials.filter(m => (getItemSectionKey(m) || defaultSectionId) === (getSectionKey(section) || defaultSectionId))}
              onReorder={async (reordered) => { setMaterials(prev => { const sectionKey = getSectionKey(section) || defaultSectionId; let pointer = 0; return prev.map(m => { const k = getItemSectionKey(m) || defaultSectionId; if (k === sectionKey) { const r = reordered[pointer] || m; pointer++; return r; } return m; }); }); try { await apiFetch("/materials/reorder", { method: "POST", body: { order: reordered.map(r => r.id) } }); } catch (e) { console.error(e); } }}
              onDelete={async (id) => { try { await apiFetch(`/materials/${id}`, { method: "DELETE" }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } }}
              onUpdate={async (id, updates) => { try { await apiFetch(`/materials/${id}`, { method: "PATCH", body: updates }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } }}
              getFileIcon={(fileType: string) => { if (fileType?.includes("video")) return <Video className="h-4 w-4" />; if (fileType?.includes("pdf")) return <FileText className="h-4 w-4" />; if (fileType?.includes("text/html")) return <BookOpen className="h-4 w-4" />; return <File className="h-4 w-4" />; }}
            />
            <DraggableAssignmentList
              assignments={assignments.filter(a => doesAssignmentBelongToSection(a, section))}
              onDelete={async (id) => { try { await apiFetch(`/assignments/${id}`, { method: "DELETE" }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } }}
              onUpdate={async (id, updates) => { try { await apiFetch(`/assignments/${id}`, { method: "PATCH", body: updates }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } }}
              onToggleHide={async (id, isHidden) => { try { await apiFetch(`/assignments/${id}`, { method: "PATCH", body: { is_hidden: isHidden } }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } }}
              onSetDeadline={openAssignmentDeadlineDialog}
            />
            <DraggableQuizList
              quizzes={sectionQuizzes.filter(q => (getItemSectionKey(q) || defaultSectionId) === (getSectionKey(section) || defaultSectionId))}
              onDelete={async (id) => { try { await apiFetch(`/quizzes/${id}`, { method: "DELETE" }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } }}
              onUpdate={async (id, updates) => { try { await apiFetch(`/quizzes/${id}`, { method: "PATCH", body: updates }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } }}
              onToggleHide={async (id, isHidden) => { try { await apiFetch(`/quizzes/${id}`, { method: "PATCH", body: { is_hidden: isHidden } }); loadCourseData(); } catch (error: any) { toast.error(error.message || "Failed"); } }}
              onSetDeadline={openQuizDeadlineDialog}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!course) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold break-words">{course.title}</h1>
            <p className="text-muted-foreground">{course.code}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
              <DialogTrigger asChild><Button className="gap-2 w-full sm:w-auto"><UserPlus className="h-4 w-4" />Enroll User</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Enroll User</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>{users.filter(u => !enrolledStudents.find((s: any) => s.id === u.id)).map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button onClick={handleEnrollUser}>Enroll</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" onClick={handleDeleteCourse} className="gap-2 w-full sm:w-auto"><Trash2 className="h-4 w-4" />Delete Course</Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg sm:text-xl">Course Sections</CardTitle>
                <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
                  <DialogTrigger asChild><Button size="sm" className="gap-2 w-full sm:w-auto"><Plus className="h-4 w-4" />Add Section</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Section</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Title</Label><Input value={newSection.title} onChange={e => setNewSection({ ...newSection, title: e.target.value })} /></div>
                      <div><Label>Description</Label><Textarea value={newSection.description} onChange={e => setNewSection({ ...newSection, description: e.target.value })} /></div>
                      <Button onClick={handleAddSection}>Add Section</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
            </Card>
            <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">{sections.map(section => <SortableSectionCard key={section.id} section={section} />)}</div>
              </SortableContext>
            </DndContext>
          </TabsContent>
          <TabsContent value="students">
            <Card>
              <CardHeader><CardTitle>Enrolled Students</CardTitle></CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
                    <TableBody>{enrolledStudents.map((student: any) => <TableRow key={student.id}><TableCell>{student.full_name || "N/A"}</TableCell><TableCell>{student.email}</TableCell></TableRow>)}</TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Deadline Dialog */}
      <Dialog open={deadlineDialogOpen} onOpenChange={async (open) => { if (open) { const options = await ensureUsersLoaded(); if (!selectedUserForDeadline && options.length) setSelectedUserForDeadline(getDefaultDeadlineUser(options)); } setDeadlineDialogOpen(open); if (!open) { setSelectedAssignmentForDeadline(null); setSelectedQuizForDeadline(null); setSelectedUserForDeadline(""); setCustomDeadline(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Set Custom Deadline</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">{selectedAssignmentForDeadline ? `Assignment: ${selectedAssignmentForDeadline.title}` : selectedQuizForDeadline ? `Quiz: ${selectedQuizForDeadline.title}` : "Select an assignment or quiz."}</div>
            <div>
              <Label>User</Label>
              {mergedUserOptions.length ? (
                <Select value={selectedUserForDeadline} onValueChange={setSelectedUserForDeadline}>
                  <SelectTrigger><SelectValue placeholder="Choose learner" /></SelectTrigger>
                  <SelectContent>{deadlineUserOptions.map(({ selectionId, user: u }) => <SelectItem key={selectionId} value={selectionId}>{u.full_name || u.email}</SelectItem>)}</SelectContent>
                </Select>
              ) : <p className="text-sm text-muted-foreground">No users available.</p>}
            </div>
            <div><Label>Deadline (local time)</Label><Input type="datetime-local" value={customDeadline} onChange={e => setCustomDeadline(e.target.value)} /></div>
            <Button onClick={handleSetUserDeadline} className="w-full" disabled={!mergedUserOptions.length && !user?.id}>Save Deadline</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={open => { setAssignmentDialogOpen(open); if (!open) { setNewAssignment(getDefaultAssignmentState()); setAssignmentFile(null); setAssignmentSectionContext(null); } }}>
        <DialogContent className="max-w-2xl max-h-[60vh] overflow-auto flex items-center justify-center ">
          {activityLoading && <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-20 flex items-center justify-center"><div className="flex items-center gap-2 text-sm font-medium"><Loader2 className="h-4 w-4 animate-spin" />Adding assignment...</div></div>}
          <DialogHeader><DialogTitle>Add Assignment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} /></div>
            <div><Label>Section</Label><div className="rounded-lg border border-input/40 bg-background px-3 py-2 text-sm text-muted-foreground">{assignmentSectionContext?.title || "No section selected"}</div></div>
            <div><Label>Unit name</Label><Input value={newAssignment.unit_name} onChange={e => setNewAssignment(prev => ({ ...prev, unit_name: e.target.value }))} placeholder="Optional unit identifier" /></div>
            <div><Label>Description</Label><RichTextEditor content={newAssignment.description || ""} onChange={content => setNewAssignment({ ...newAssignment, description: content })} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Points</Label><Input type="number" value={newAssignment.points} onChange={e => setNewAssignment({ ...newAssignment, points: parseInt(e.target.value) })} /></div>
              <div><Label>Passing Marks</Label><Input type="number" value={newAssignment.passing_marks} onChange={e => setNewAssignment({ ...newAssignment, passing_marks: parseInt(e.target.value) })} /></div>
            </div>
            <div><Label>Due Date</Label><Input type="datetime-local" value={newAssignment.due_date} onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button onClick={handleAddAssignment} disabled={activityLoading}>{activityLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Add Assignment"}</Button>
              <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={open => { setActivityDialogOpen(open); if (!open) setActivityType(null); }}>
        <DialogContent className="max-w-2xl max-h-[60vh] overflow-auto flex items-center justify-center ">
          {isActivityDialogBusy && <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-20 flex items-center justify-center"><div className="flex items-center gap-2 text-sm font-medium"><Loader2 className="h-4 w-4 animate-spin" />{activityOverlayLabel}</div></div>}
          <DialogHeader><DialogTitle>Add Activity</DialogTitle><DialogDescription className="sr-only">Choose activity type.</DialogDescription></DialogHeader>
          {!activityType ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[["text", FileText, "Text Lesson"], ["file", File, "File"], ["pdf", FileText, "PDF"], ["powerpoint", Presentation, "PowerPoint"], ["brief", FileQuestion, "Assessment Brief"], ["quiz", BookOpen, "Quiz"], ["google_drive", File, "Google Drive"], ["video_lecture", Video, "Video Lecture"]].map(([type, Icon, label]: any) => (
                <Button key={type} variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setActivityType(type)}><Icon className="h-8 w-8" />{label}</Button>
              ))}
            </div>
          ) : activityType === "text" ? (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={newTextLesson.title} onChange={e => setNewTextLesson({ ...newTextLesson, title: e.target.value })} /></div>
              <div><Label>Content</Label><RichTextEditor content={newTextLesson.content} onChange={content => setNewTextLesson({ ...newTextLesson, content })} /></div>
              <div className="flex gap-2"><Button onClick={handleAddTextLesson} disabled={activityLoading}>{activityLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add"}</Button><Button variant="outline" onClick={() => { setActivityType(null); setNewTextLesson({ title: "", content: "" }); }}>Back</Button></div>
            </div>
          ) : activityType === "file" ? (
            <div className="space-y-4">
              <div><Label>Display Name</Label><Input value={fileDisplayName} onChange={e => setFileDisplayName(e.target.value)} placeholder="Enter display name" /></div>
              <div><Label>Upload Files</Label><Input type="file" multiple onChange={e => setUploadFiles(Array.from(e.target.files || []))} /></div>
              <div className="flex gap-2"><Button onClick={handleUploadMaterials} disabled={activityLoading}>{activityLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : "Upload"}</Button><Button variant="outline" onClick={() => { setActivityType(null); setFileDisplayName(""); setUploadFiles([]); }}>Back</Button></div>
            </div>
          ) : activityType === "pdf" ? (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} placeholder="Enter PDF title" /></div>
              <div><Label>Upload PDF</Label><Input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} /></div>
              <div className="flex gap-2"><Button onClick={handleAddPdf} disabled={pdfUploading}>{pdfUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add PDF"}</Button><Button variant="outline" onClick={() => { setActivityType(null); setPdfTitle(""); setPdfFile(null); }}>Back</Button></div>
            </div>
          ) : activityType === "powerpoint" ? (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={pptTitle} onChange={e => setPptTitle(e.target.value)} placeholder="Enter PowerPoint title" /></div>
              <div><Label>Upload PowerPoint</Label><Input type="file" accept=".ppt,.pptx" onChange={e => setPptFile(e.target.files?.[0] || null)} /></div>
              <div className="flex gap-2"><Button onClick={handleAddPowerPoint} disabled={pptUploading}>{pptUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add PowerPoint"}</Button><Button variant="outline" onClick={() => { setActivityType(null); setPptTitle(""); setPptFile(null); }}>Back</Button></div>
            </div>
          ) : activityType === "google_drive" ? (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={googleDriveTitle} onChange={e => setGoogleDriveTitle(e.target.value)} placeholder="Enter title" /></div>
              <div><Label>Google Drive Link</Label><Input value={googleDriveUrl} onChange={e => setGoogleDriveUrl(e.target.value)} placeholder="Paste Google Drive link" /></div>
              <div className="flex gap-2"><Button onClick={handleAddGoogleDrive} disabled={activityLoading}>{activityLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add"}</Button><Button variant="outline" onClick={() => { setActivityType(null); setGoogleDriveUrl(""); setGoogleDriveTitle(""); }}>Back</Button></div>
            </div>
          ) : activityType === "video_lecture" ? (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Enter video title" /></div>
              <div><Label>Upload Video</Label><Input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} /></div>
              <div className="flex gap-2"><Button onClick={handleAddVideoLecture} disabled={activityLoading}>{activityLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : "Add Video"}</Button><Button variant="outline" onClick={() => { setActivityType(null); setVideoTitle(""); setVideoFile(null); }}>Back</Button></div>
            </div>
          ) : activityType === "brief" ? (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} /></div>
              <div><Label>Assessment Brief Content</Label><RichTextEditor content={newAssignment.assessment_brief || ""} onChange={content => setNewAssignment({ ...newAssignment, assessment_brief: content })} /></div>
              <div><Label>Upload File (Optional)</Label><Input type="file" onChange={e => setAssignmentFile(e.target.files?.[0] || null)} /></div>
              <div className="flex gap-2"><Button onClick={handleAddAssessmentBrief} disabled={activityLoading}>{activityLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : "Add Brief"}</Button><Button variant="outline" onClick={() => { setActivityType(null); setNewAssignment(getDefaultAssignmentState()); setAssignmentFile(null); }}>Back</Button></div>
            </div>
          ) : activityType === "quiz" ? (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={newQuiz.title} onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })} /></div>
              <div><Label>Quiz URL</Label><Input value={newQuiz.quiz_url} onChange={e => setNewQuiz({ ...newQuiz, quiz_url: e.target.value })} placeholder="Enter external quiz URL" /></div>
              <div><Label>Description</Label><RichTextEditor content={newQuiz.description || ""} onChange={content => setNewQuiz({ ...newQuiz, description: content })} /></div>
              <div><Label>Duration (minutes)</Label><Input type="number" value={newQuiz.duration} onChange={e => setNewQuiz({ ...newQuiz, duration: parseInt(e.target.value) })} /></div>
              <div><Label>Due Date</Label><Input type="datetime-local" value={newQuiz.due_date} onChange={e => setNewQuiz({ ...newQuiz, due_date: e.target.value })} /></div>
              <div className="flex gap-2"><Button onClick={handleAddQuiz} disabled={activityLoading}>{activityLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Add Quiz"}</Button><Button variant="outline" onClick={() => { setActivityType(null); setNewQuiz({ title: "", quiz_url: "", description: "", duration: 30, due_date: "" }); }}>Back</Button></div>
            </div>
          ) : null}
          {uploadProgress !== null && (
            <div className="mt-4 text-sm text-muted-foreground">{activeUploadMode === "chunked" ? "Chunked upload" : activeUploadMode === "direct" ? "Direct upload" : "Uploading"}: {uploadProgress}% complete</div>
          )}
        </DialogContent>
      </Dialog>

      <CertificateGeneratedDialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen} />
    </DashboardLayout>
  );
}
