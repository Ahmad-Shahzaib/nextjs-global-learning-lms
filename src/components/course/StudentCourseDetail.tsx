// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid, ClipboardList, Award, ChevronDown, ChevronRight,
  FileText, FileQuestion, BookOpen, Menu, Download, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { toast } from "@/hooks/use-toast";
import { updateLearningStatus } from "@/store/redux/thunks/learningStatusThunk";
import { GlobalLearningLogoLink } from "@/components/UECampusLogoLink";
import { API_BASE_URL, apiFetch, resolveStorageUrl } from "@/lib/api";

// ─── Helpers defined OUTSIDE component so they're never recreated ──────────────

function getTranslationTitle(item: any, fallback = "Untitled") {
  return item?.title || item?.name || item?.translations?.[0]?.title || item?.translations?.[0]?.name || fallback;
}

function getTranslationContent(item: any) {
  return item?.content || item?.translations?.[0]?.content || "";
}

function getFileNameFromPath(path?: string) {
  if (!path) return "Untitled file";
  return (path.split("/").pop() || path).split("?")[0].split("#")[0];
}

function getLearningStatusItemType(item: any) {
  if (!item) return "";
  if (item.icon === "text") return "text_lesson_id";
  if (item.icon === "pdf" || item.icon === "file") return "file_id";
  if (item.icon === "quiz") return "quiz_id";
  return "item_id";
}

function getLearningStatusKey(item: any) {
  const itemType = getLearningStatusItemType(item);
  const itemId = Number(item?.raw?.id ?? item?.id ?? 0);
  return `${itemType}:${itemId}`;
}

function buildFileUrl(source: any) {
  const filePath = source?.file || source?.file_path || source?.link_url || source?.url || "";
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  if (filePath.startsWith("/store/")) {
    const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    return `${apiOrigin}${filePath}`;
  }
  return resolveStorageUrl(filePath);
}

function normalizeCourseData(data: any) {
  // Runs once per query result — heavy work isolated here
  const chaptersRaw: any[] = data.chapters || data.sections || data.course_sections || [];

  const fileMap = new Map<number, any>();
  (data.files || []).forEach((f: any) => fileMap.set(Number(f.id), f));
  const textLessonMap = new Map<number, any>();
  (data.text_lessons || []).forEach((t: any) => textLessonMap.set(Number(t.id), t));
  const quizMap = new Map<number, any>();
  (data.quizzes || []).forEach((q: any) => quizMap.set(Number(q.id), q));

  const normalizedSections = chaptersRaw.map((chapter: any, idx: number) => {
    const id = String(chapter?.id || chapter?.section_id || `section-${idx}`);
    const title = chapter?.title || chapter?.name || chapter?.translations?.[0]?.title || `Section ${idx + 1}`;
    const chapterItems: any[] = chapter.chapter_items || chapter.chapterItems || [];
    const sortedItems = [...chapterItems].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

    const items = sortedItems.flatMap((ci: any) => {
      const itemId = Number(ci.item_id);
      const type: string = ci.type;

      if (type === "file") {
        const fileData = fileMap.get(itemId);
        if (!fileData) return [];
        const fileUrl = buildFileUrl(fileData);
        const sourcePath = fileData.file || fileData.file_path || "";
        const ext = ("" + sourcePath).split(".").pop()?.toLowerCase();
        const isPdf = ext === "pdf" || String(fileData.file_type || "").toLowerCase().includes("pdf");
        return [{
          id: `file-${fileData.id}`,
          icon: isPdf ? "pdf" : "file",
          title: getTranslationTitle(fileData, getFileNameFromPath(sourcePath)),
          subtitle: fileData.volume ? `pdf | ${fileData.volume} MB` : (fileData.file_type || "File"),
          fileUrl,
          raw: fileData,
          hasToggle: isPdf,
        }];
      }
      if (type === "text_lesson") {
        const lessonData = textLessonMap.get(itemId);
        if (!lessonData) return [];
        return [{
          id: `text-${lessonData.id}`,
          icon: "text",
          title: getTranslationTitle(lessonData, "Notes & Lecture"),
          subtitle: (lessonData?.summary || lessonData?.translations?.[0]?.summary || "") || "Text lesson",
          textContent: getTranslationContent(lessonData),
          raw: lessonData,
        }];
      }
      if (type === "quiz") {
        const quizData = quizMap.get(itemId);
        if (!quizData) return [];
        const questionCount = quizData?.quiz_questions?.length || quizData?.questions?.length || 0;
        return [{
          id: `quiz-${quizData.id}`,
          icon: "quiz",
          title: getTranslationTitle(quizData, "Quiz"),
          subtitle: quizData.total_mark ? `${quizData.total_mark} marks` : `${questionCount} question${questionCount !== 1 ? "s" : ""}`,
          quizData,
          quizUrl: quizData.quiz_url || "",
        }];
      }
      return [];
    });

    return { id, title, topicCount: items.length, items };
  });

  if (normalizedSections.length === 0) {
    normalizedSections.push({ id: "default-section", title: "Course Content", topicCount: 0, items: [] });
  }

  return normalizedSections;
}

// ─── Student sidebar item icon ─────────────────────────────────────────────────
function ItemIcon({ type }: { type: "pdf" | "file" | "quiz" | "text" }) {
  if (type === "pdf")
    return <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center flex-none"><FileText className="h-4 w-4 text-white" /></div>;
  if (type === "quiz")
    return <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center flex-none"><FileQuestion className="h-4 w-4 text-white" /></div>;
  if (type === "text")
    return <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center flex-none"><BookOpen className="h-4 w-4 text-white" /></div>;
  return <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center flex-none"><FileText className="h-4 w-4 text-white" /></div>;
}

// ─── Student View ──────────────────────────────────────────────────────────────
export function StudentCourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [readToggles, setReadToggles] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<{ sectionId: string; itemIdx: number } | null>(null);
  const [selectedAssessmentSectionId, setSelectedAssessmentSectionId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"content" | "assessment" | "certificates">("content");
  // Open/closed state keyed by section id — no longer stores full section objects
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const { data: courseData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["courseDetail", courseId, user?.id],
    queryFn: async () => {
      if (!courseId) throw new Error("Invalid course ID");
      let data = await apiFetch<any>(`/v2/panel/webinars/${courseId}`);
      if (data && typeof data === "object" && "success" in data) {
        if (!data.success) throw new Error(data.message || "Failed to load webinar");
        data = Array.isArray(data.data) ? data.data[0] || null : data.data;
      }
      if (!data) throw new Error("Course not found");
      return data;
    },
    enabled: !!courseId && user !== undefined,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    placeholderData: (prev) => prev, // replaces keepPreviousData in v5
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // FIX: Normalize synchronously in useMemo — no intermediate useState/useEffect hop.
  // useDeferredValue lets React show stale UI instantly while the new value computes,
  // so the page never blocks on normalization.
  const deferredCourseData = useDeferredValue(courseData);

  const sections = useMemo(() => {
    if (!deferredCourseData) return [];
    return normalizeCourseData(deferredCourseData);
  }, [deferredCourseData]);

  const course = deferredCourseData ?? null;

  // Initialise open state and first selection only when courseId changes
  useEffect(() => {
    if (sections.length === 0) return;
    setOpenSections(
      Object.fromEntries(sections.map((s, index) => [s.id, index === 0]))
    );
    setReadToggles({});
    setSelectedAssessmentSectionId(null);
    setSelectedItem({ sectionId: sections[0].id, itemIdx: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]); // intentionally only on courseId change, not on sections

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = Boolean(prev[sectionId]);
      if (isCurrentlyOpen) {
        return Object.fromEntries(sections.map((section) => [section.id, false]));
      }
      return Object.fromEntries(
        sections.map((section) => [section.id, section.id === sectionId])
      );
    });
  }, [sections]);

  const error = queryError ? (queryError as Error).message : null;
  const courseProgress = Number(course?.progress ?? 0);

  const currentSection = useMemo(
    () => sections.find((s) => s.id === selectedItem?.sectionId) || sections[0],
    [sections, selectedItem?.sectionId]
  );

  const currentItem = useMemo(
    () => currentSection?.items?.[selectedItem?.itemIdx ?? 0] || null,
    [currentSection, selectedItem?.itemIdx]
  );

  const getAssessmentItems = useCallback(
    (section: any) => (section?.items || []).filter((item: any) => item.icon === "quiz" || item.icon === "file"),
    []
  );

  const assessmentSelectedSection = useMemo(
    () => sections.find((s) => s.id === selectedAssessmentSectionId) || null,
    [sections, selectedAssessmentSectionId]
  );

  const assessmentSelectedItems = useMemo(
    () => getAssessmentItems(assessmentSelectedSection),
    [assessmentSelectedSection, getAssessmentItems]
  );

  const assessmentNoItemsSelected = panel === "assessment" && selectedAssessmentSectionId && assessmentSelectedItems.length === 0;

  const dispatch = useAppDispatch();
  const learningStatuses = useAppSelector((state) => state.learningStatus.statuses);

  const courseHasCertificate = useMemo(() => Boolean(
    course?.certificate !== undefined &&
    String(course.certificate).toLowerCase() !== "0" &&
    String(course.certificate).toLowerCase() !== "false"
  ), [course]);

  const courseCertificateEnabledQuizzes = useMemo(() =>
    Array.isArray(course?.quizzes) && course.quizzes.length > 0
      ? course.quizzes.filter((quiz: any) =>
        Boolean(quiz?.certificate) &&
        String(quiz.certificate).toLowerCase() !== "0" &&
        String(quiz.certificate).toLowerCase() !== "false"
      )
      : [],
    [course]
  );

  const handleToggleLearningStatus = useCallback(
    async (toggleKey: string, item: any, toggledValue: boolean) => {
      const itemType = getLearningStatusItemType(item);
      const itemId = Number(item?.raw?.id ?? item?.id ?? 0);
      const statusKey = `${itemType}:${itemId}`;

      setReadToggles((prev) => ({ ...prev, [toggleKey]: toggledValue }));

      if (!courseId) {
        toast({
          title: "Cannot update status",
          description: "Course ID is missing",
          variant: "destructive",
        });
        return;
      }

      try {
        await dispatch(
          updateLearningStatus({
            courseId: Number(courseId),
            item: itemType,
            item_id: itemId,
            status: toggledValue,
          }),
        ).unwrap();

        toast({
          title: "Lesson status updated",
          description: `${item.title || "Content"} marked as ${toggledValue ? "read" : "unread"}`,
        });
      } catch (error: any) {
        setReadToggles((prev) => ({ ...prev, [toggleKey]: !toggledValue }));
        toast({
          title: "Update failed",
          description: error?.toString() || "Unable to update learning status",
          variant: "destructive",
        });
      }
    },
    [courseId, dispatch, toast],
  );

  const courseCertificateStatus = useMemo(
    () => courseProgress >= 100 ? "Completed" : "In Progress",
    [courseProgress]
  );

  const tabs = [
    { key: "content" as const, label: "Content", Icon: LayoutGrid },
    { key: "assessment" as const, label: "Assessment", Icon: ClipboardList },
    { key: "certificates" as const, label: "Certificates", Icon: Award },
  ];

  const courseTitle = course?.title || course?.translations?.[0]?.title || course?.name || "Loading Course...";

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <header className="border-b border-slate-200 bg-white flex-none">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <GlobalLearningLogoLink className="h-10 w-auto flex-none" />
          <h1 className="flex-1 text-sm md:text-base font-semibold text-slate-800 truncate min-w-0">
            {courseTitle}
          </h1>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 flex-none">
            <div className="h-1.5 w-40 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-[#5b3fd6]" style={{ width: `${courseProgress}%` }} />
            </div>
            <span>{courseProgress}% Learnt</span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-sm text-slate-600 flex-none">
            <Link to="/courses" className="hover:text-slate-900 font-medium">Course Page</Link>
            <Link to="/courses" className="hover:text-slate-900 font-medium">My Courses</Link>
            <button className="p-1 rounded hover:bg-slate-100"><Menu className="h-5 w-5 text-slate-500" /></button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-sm text-destructive">Error: {error}</div>
        </div>
      ) : (
        <div className="flex flex-row-reverse flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">


            <div className="flex-1 overflow-hidden bg-white">
              {loading && !courseData ? (
                <div className="h-full flex flex-col items-center justify-center p-10 animate-pulse">
                  <div className="w-16 h-16 bg-slate-100 rounded-full mb-4" />
                  <div className="w-64 h-8 bg-slate-100 rounded mb-2" />
                  <div className="w-48 h-4 bg-slate-100 rounded" />
                </div>
              ) : (() => {
                if (assessmentNoItemsSelected) {
                  return (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      No assessment items in this chapter.
                    </div>
                  );
                }

                if (!currentItem) {
                  return (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Select a lesson or resource from the sidebar
                    </div>
                  );
                }

                if (currentItem.icon === "text") {
                  return (
                    <div className="h-full p-3 overflow-y-auto bg-gradient-to-br from-white to-slate-100">
                      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{currentItem.title}</h2>
                        {currentItem.subtitle && currentItem.subtitle !== "Text lesson" && (
                          <p className="text-sm md:text-base text-slate-500 mb-4">{currentItem.subtitle}</p>
                        )}
                        {currentItem.textContent ? (
                          <article className="prose prose-slate prose-lg max-w-none text-slate-700 break-words prose-headings:font-semibold prose-headings:text-slate-900 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:text-indigo-800 prose-blockquote:border-l-4 prose-blockquote:border-indigo-100 prose-blockquote:bg-indigo-50 prose-blockquote:text-indigo-800 prose-ol:list-decimal prose-ul:list-disc prose-img:rounded-xl prose-img:shadow-sm prose-table:table-auto prose-table:border prose-table:border-slate-200 prose-table:rounded-lg prose-table:px-2 prose-table:py-1">
                            <div dangerouslySetInnerHTML={{ __html: currentItem.textContent }} />
                          </article>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-sm text-slate-400">No content available for this lesson.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (currentItem.icon === "pdf" && currentItem.fileUrl) {
                  return (
                    <div className="flex flex-col h-full bg-slate-900">
                      {/* Premium PDF Header */}
                      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 flex-none">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center flex-none">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold truncate leading-tight">
                              {currentItem.title}
                            </h3>
                            {currentItem.subtitle && (
                              <p className="text-slate-400 text-xs truncate mt-0.5">
                                {currentItem.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors"
                            asChild
                          >
                            <a href={currentItem.fileUrl} target="_blank" rel="noopener noreferrer" download>
                              <Download className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Download PDF</span>
                              <span className="sm:hidden">Download</span>
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white hover:bg-white/5 hidden sm:flex"
                            onClick={() => {
                              const iframe = document.getElementById('course-pdf-iframe') as HTMLIFrameElement;
                              if (iframe?.requestFullscreen) iframe.requestFullscreen();
                            }}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* PDF Frame */}
                      <div className="flex-1 bg-slate-800 relative">
                        <iframe
                          id="course-pdf-iframe"
                          src={`${currentItem.fileUrl}#view=FitH`}
                          className="w-full h-full border-0"
                          title={currentItem.title || "PDF Preview"}
                          allow="autoplay; fullscreen"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                }

                if (currentItem.icon === "file") {
                  if (!currentItem.fileUrl) {
                    return (
                      <div className="h-full flex items-center justify-center text-slate-500">
                        File URL is not available for this resource.
                      </div>
                    );
                  }
                  const fileIsPdf = String(currentItem.fileUrl).toLowerCase().endsWith(".pdf");
                  return (
                    <div className="h-full flex flex-col">
                      <div className="px-4 py-4 border-b bg-slate-50">
                        <h2 className="text-lg font-bold">{currentItem.title}</h2>
                        {currentItem.subtitle && (
                          <p className="text-sm text-slate-500">{currentItem.subtitle}</p>
                        )}
                        <Button className="mt-2" asChild>
                          <a href={currentItem.fileUrl} target="_blank" rel="noopener noreferrer" download>
                            Download
                          </a>
                        </Button>
                      </div>
                      {fileIsPdf ? (
                        <div className="flex-1 flex flex-col bg-slate-900 mt-2 rounded-t-3xl overflow-hidden border-t border-x border-slate-800">
                          <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800">
                            <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-red-500" />
                              PDF Document Viewer
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white h-8"
                              onClick={() => {
                                const iframe = document.getElementById('file-pdf-iframe') as HTMLIFrameElement;
                                if (iframe?.requestFullscreen) iframe.requestFullscreen();
                              }}
                            >
                              <Maximize2 className="h-3 w-3 mr-2" />
                              Fullscreen
                            </Button>
                          </div>
                          <iframe
                            id="file-pdf-iframe"
                            src={`${currentItem.fileUrl}#view=FitH`}
                            className="w-full h-full border-0"
                            title={currentItem.title || "PDF Content"}
                            allow="autoplay; fullscreen"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="flex-1 p-8 text-center flex flex-col items-center justify-center bg-slate-50 border-t">
                          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Download className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">Resource Ready</h3>
                          <p className="text-slate-500 mt-2 mb-6 max-w-sm">This file is ready for download and can be opened in a new tab for full access.</p>
                          <div className="flex items-center gap-3">
                            <Button asChild>
                              <a href={currentItem.fileUrl} target="_blank" rel="noopener noreferrer" download>
                                Download Now
                              </a>
                            </Button>
                            <Button variant="outline" asChild>
                              <a href={currentItem.fileUrl} target="_blank" rel="noopener noreferrer">
                                Open in New Tab
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (currentItem.icon === "quiz") {
                  const quizData = currentItem.quizData || {};
                  const quizQuestions = quizData.quiz_questions || quizData.questions || [];
                  const quizResults = quizData.quiz_results || [];
                  return (
                    <div className="h-full p-6 overflow-y-auto">
                      <h2 className="text-2xl font-bold mb-2">{currentItem.title}</h2>
                      {currentItem.subtitle && (
                        <p className="text-sm text-slate-500 mb-4">{currentItem.subtitle}</p>
                      )}
                      <div className="mt-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Quiz Questions</h3>
                          {quizQuestions.length > 0 ? (
                            <ul className="mt-2 list-disc list-inside text-sm text-slate-600">
                              {quizQuestions.map((qq: any, qIdx: number) => (
                                <li key={qq.id ?? qIdx} className="mb-1">
                                  <strong>{qq.title || qq.description || `Question ${qIdx + 1}`}</strong>
                                  {qq.description && <p className="text-xs text-slate-500">{qq.description}</p>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400 mt-2">No quiz questions available yet.</p>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Quiz Results</h3>
                          {quizResults.length > 0 ? (
                            <ul className="mt-2 space-y-2 text-sm text-slate-600">
                              {quizResults.map((qr: any, rIdx: number) => (
                                <li key={qr.id ?? rIdx} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                  <p><strong>Attempt:</strong> {qr.attempt ?? rIdx + 1}</p>
                                  <p><strong>Score:</strong> {qr.user_grade ?? qr.results ?? "N/A"}</p>
                                  {qr.status && <p><strong>Status:</strong> {qr.status}</p>}
                                  {qr.feedback && <p className="text-xs text-slate-500">{qr.feedback}</p>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400 mt-2">No quiz results available yet.</p>
                          )}
                        </div>
                        {quizQuestions.length === 0 && quizResults.length === 0 && (
                          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                            No quiz question or result data is available for this quiz yet.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    Content not available yet
                  </div>
                );
              })()}
            </div>
          </div>

          <aside className="w-[340px] border-r border-slate-200 bg-white flex flex-col flex-none overflow-hidden shadow-sm">
            {/* Tabs Header - Updated look */}
            <div className="flex items-center border-b border-slate-200 px-4 py-4 flex-none bg-orange-100 overflow-hidden">
              <div className="flex w-full flex-nowrap gap-2">
                {tabs.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPanel(key)}
                    aria-current={panel === key ? "page" : undefined}
                    className={cn(
                      "flex-1 min-w-0 flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition duration-200 whitespace-nowrap",
                      panel === key
                        ? "border-transparent bg-orange-500 text-white shadow-lg shadow-indigo-500/10"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto py-6 px-5 space-y-6 bg-white">
              {/* Loading State */}
              {loading && !courseData ? (
                <div className="space-y-5 animate-pulse px-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-slate-100 rounded-3xl w-full"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {/* Content Panel */}
                  {panel === "content" &&
                    sections.map((section) => {
                      const isOpen = openSections[section.id] ?? true;

                      return (
                        <div
                          key={section.id}
                          className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md"
                        >
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="h-10 w-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center flex-none shadow-sm">
                                <LayoutGrid className="h-5 w-5" />
                              </div>
                              <div className="text-left min-w-0">
                                <h3 className="font-semibold text-slate-900 leading-tight break-words">
                                  {section.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {section.topicCount} Topic{section.topicCount !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>

                            <div className="text-slate-400 group-hover:text-slate-500 transition-colors">
                              {isOpen ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="border-t border-slate-100 bg-slate-50/70">
                              {section.items.length === 0 ? (
                                <p className="px-6 py-6 text-sm text-slate-400 italic">
                                  No content in this unit yet.
                                </p>
                              ) : (
                                section.items.map((item: any, idx: number) => {
                                  const toggleKey = `${section.id}-${idx}`;
                                  const statusKey = getLearningStatusKey(item);
                                  const persistedStatus = learningStatuses[statusKey];
                                  const isToggled =
                                    typeof readToggles[toggleKey] !== "undefined"
                                      ? readToggles[toggleKey]
                                      : persistedStatus ?? false;

                                  const isSelected =
                                    selectedItem?.sectionId === section.id &&
                                    selectedItem?.itemIdx === idx;

                                  return (
                                    <div
                                      key={item.id || idx}
                                      className={cn(
                                        "px-6 py-4 border-b border-slate-100 last:border-b-0 cursor-pointer transition-all group",
                                        isSelected
                                          ? "bg-indigo-50/80 border-l-4 border-[#5b3fd6]"
                                          : "hover:bg-white"
                                      )}
                                      onClick={() => {
                                        setSelectedAssessmentSectionId(null);
                                        setSelectedItem({ sectionId: section.id, itemIdx: idx });
                                      }}
                                    >
                                      <div className="flex items-start gap-4">
                                        <ItemIcon type={item.icon} />
                                        <div className="flex-1 min-w-0 pt-0.5">
                                          <p
                                            className={cn(
                                              "text-sm font-medium leading-snug break-words transition-colors",
                                              isSelected
                                                ? " font-semibold"
                                                : "text-slate-800 group-hover:text-slate-900"
                                            )}
                                          >
                                            {item.title}
                                          </p>
                                          {item.subtitle && (
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                              {item.subtitle}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {item.hasToggle && (
                                        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                                          <span className="font-medium">Mark as read</span>
                                          <Switch
                                            checked={isToggled}
                                            onCheckedChange={(v) =>
                                              handleToggleLearningStatus(toggleKey, item, Boolean(v))
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Assessment Panel - Cleaner Cards */}
                  {!loading && panel === "assessment" && (
                    <div className="space-y-5">
                      {sections.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 text-center">
                          <p className="text-slate-400">No chapters available yet.</p>
                        </div>
                      ) : (
                        sections.map((section, sectionIndex) => {
                          const chapterTitle = section.title || `Chapter ${sectionIndex + 1}`;
                          const assessmentItems = getAssessmentItems(section);
                          const firstAssessmentIndex = (section.items || []).findIndex(
                            (item: any) => item.icon === "quiz" || item.icon === "file"
                          );

                          return (
                            <div
                              key={section.id || sectionIndex}
                              className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 cursor-pointer hover:shadow transition-all active:scale-[0.985]"
                              onClick={() => {
                                setSelectedAssessmentSectionId(section.id || null);
                                if (firstAssessmentIndex >= 0) {
                                  setSelectedItem({ sectionId: section.id, itemIdx: firstAssessmentIndex });
                                } else {
                                  setSelectedItem(null);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-slate-900">
                                    Chapter {sectionIndex + 1}: {chapterTitle}
                                  </h3>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {section.topicCount ?? section.items?.length ?? 0} topic
                                    {(section.topicCount ?? section.items?.length ?? 0) === 1 ? "" : "s"}
                                  </p>
                                </div>
                              </div>

                              {assessmentItems.length > 0 ? (
                                <ul className="mt-5 space-y-1 text-sm">
                                  {assessmentItems.map((item: any, idx: number) => {
                                    const absoluteItemIndex = (section.items || []).findIndex(
                                      (i: any) => i === item
                                    );
                                    const isActive =
                                      selectedItem?.sectionId === section.id &&
                                      selectedItem?.itemIdx === absoluteItemIndex;

                                    return (
                                      <li
                                        key={item.id || idx}
                                        className={cn(
                                          "px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2",
                                          isActive
                                            ? "bg-indigo-50 text-[#5b3fd6] font-medium"
                                            : "hover:bg-slate-100 text-slate-700"
                                        )}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setSelectedAssessmentSectionId(section.id || null);
                                          setSelectedItem({ sectionId: section.id, itemIdx: absoluteItemIndex });
                                        }}
                                      >
                                        {item.title || item.name || "Assessment item"}
                                        <span className="text-xs text-slate-400 ml-auto">({item.icon})</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="mt-4 text-sm text-slate-400">No assessment items in this chapter.</p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Certificates Panel - Clean & Professional */}
                  {!loading && panel === "certificates" && (
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8">
                      {!courseHasCertificate ? (
                        <div className="text-center py-16">
                          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                            <span className="text-3xl">🏆</span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-800">No Certificate Available</h3>
                          <p className="text-slate-500 mt-3 max-w-[260px] mx-auto">
                            This course does not include any certificate upon completion.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">Certificate</h3>
                            <p className="text-sm text-slate-500">Earned upon course completion</p>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Certificate Setting</span>
                                <span className="font-semibold text-emerald-600">Enabled</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                course.certificate: {course?.certificate ?? "n/a"}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Your Progress</span>
                                <span className="font-semibold text-slate-900">{courseProgress}%</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Status: {courseCertificateStatus}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Quiz Certificates</span>
                                <span className="font-semibold">{courseCertificateEnabledQuizzes.length}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                {courseCertificateEnabledQuizzes.length > 0
                                  ? courseCertificateEnabledQuizzes
                                    .map((quiz: any) => quiz.title || `Quiz ${quiz.id}`)
                                    .join(", ")
                                  : "No quiz certificates configured."}
                              </p>
                            </div>
                          </div>

                          <div className="pt-4">
                            <div className="bg-white border border-slate-100 rounded-2xl p-6">
                              <p className="font-semibold text-slate-900">
                                Course certificate available
                              </p>
                              <p className="text-sm text-slate-600 mt-2">
                                {courseCertificateStatus === "Completed"
                                  ? "Congratulations! You are eligible for the certificate."
                                  : "Complete all required lessons and assessments to unlock your certificate."}
                              </p>

                              {courseCertificateStatus === "Completed" && (
                                <Button
                                  size="sm"
                                  className="mt-5 w-full bg-[#5b3fd6] hover:bg-indigo-700"
                                  onClick={() => window.open("/certificates", "_blank")}
                                >
                                  View Certificate
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      )}


    </div>
  );
}