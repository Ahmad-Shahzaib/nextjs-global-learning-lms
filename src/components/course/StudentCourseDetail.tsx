// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid, ClipboardList, Award, ChevronDown, ChevronRight,
  FileText, FileQuestion, BookOpen, Menu, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { GlobalLearningLogoLink } from "@/components/UECampusLogoLink";
import { API_BASE_URL, apiFetch, resolveStorageUrl, ApiError } from "@/lib/api";

// ─── Student sidebar item icon ─────────────────────────────────────────────────
function ItemIcon({ type }: { type: "pdf" | "file" | "quiz" | "text" }) {
  if (type === "pdf")
    return <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center flex-none"><FileText className="h-4 w-4 text-red-500" /></div>;
  if (type === "quiz")
    return <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center flex-none"><FileQuestion className="h-4 w-4 text-violet-500" /></div>;
  if (type === "text")
    return <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center flex-none"><BookOpen className="h-4 w-4 text-blue-500" /></div>;
  return <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center flex-none"><FileText className="h-4 w-4 text-slate-400" /></div>;
}

// ─── Student View ──────────────────────────────────────────────────────────────
export function StudentCourseDetail() {
  const { courseId } = useParams();
  const { user, token } = useAuth();

  const [readToggles, setReadToggles] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<{ sectionId: string; itemIdx: number } | null>(null);
  const [selectedAssessmentSectionId, setSelectedAssessmentSectionId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"content" | "assessment" | "certificates">("content");

  const { data: courseData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["courseDetail", courseId, user?.id],
    queryFn: async () => {
      if (!courseId) throw new Error("Invalid course ID");
      let data = await apiFetch<any>(`/v2/panel/webinars/${courseId}`);
      if (data && typeof data === "object" && "success" in data) {
        if (!data.success) {
          throw new Error(data.message || "Failed to load webinar");
        }
        data = Array.isArray(data.data) ? data.data[0] || null : data.data;
      }
      if (!data) throw new Error("Course not found");

      // Normalization logic
      const chaptersRaw: any[] = data.chapters || data.sections || data.course_sections || [];
      const fileMap = new Map<number, any>();
      (data.files || []).forEach((f: any) => fileMap.set(Number(f.id), f));
      const textLessonMap = new Map<number, any>();
      (data.text_lessons || []).forEach((t: any) => textLessonMap.set(Number(t.id), t));
      const quizMap = new Map<number, any>();
      (data.quizzes || []).forEach((q: any) => quizMap.set(Number(q.id), q));

      const normalizedSections = chaptersRaw.map((chapter: any, idx: number) => {
        const id = getSectionId(chapter, idx);
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

        return { id, title, topicCount: items.length, open: true, items };
      });

      if (normalizedSections.length === 0) {
        normalizedSections.push({ id: "default-section", title: "Course Content", topicCount: 0, open: true, items: [] });
      }

      return { course: data, sections: normalizedSections };
    },
    enabled: !!courseId && user !== undefined,
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const course = courseData?.course || null;
  const rawSections = courseData?.sections || [];
  
  // Local state for toggling section open/close (independent of cache)
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    if (!courseId) return;

    if (rawSections.length === 0) {
      setSections([]);
      setSelectedItem(null);
      setSelectedAssessmentSectionId(null);
      setReadToggles({});
      return;
    }

    setSections(rawSections);
    setReadToggles({});
    setSelectedAssessmentSectionId(null);
    setSelectedItem({ sectionId: rawSections[0].id, itemIdx: 0 });
  }, [courseId, rawSections]);

  const error = queryError ? (queryError as Error).message : null;

  const courseProgress = Number(course?.progress ?? 0);

  const getSectionId = (section: any, index: number) =>
    String(section?.id || section?.section_id || `section-${index}`);

  const getTranslationTitle = (item: any, fallback = "Untitled") =>
    item?.title ||
    item?.name ||
    item?.translations?.[0]?.title ||
    item?.translations?.[0]?.name ||
    fallback;

  const getTranslationContent = (item: any) =>
    item?.content ||
    item?.translations?.[0]?.content ||
    "";

  const getFileNameFromPath = (path?: string) => {
    if (!path) return "Untitled file";
    const cleaned = path.split("/").pop() || path;
    return cleaned.split("?")[0].split("#")[0];
  };

  const getAssessmentItems = (section: any) =>
    (section?.items || []).filter((item: any) => item.icon === "quiz" || item.icon === "file");

  const courseHasCertificate = Boolean(
    course?.certificate !== undefined &&
    String(course.certificate).toLowerCase() !== "0" &&
    String(course.certificate).toLowerCase() !== "false"
  );

  const courseCertificateEnabledQuizzes =
    Array.isArray(course?.quizzes) && course.quizzes.length > 0
      ? course.quizzes.filter((quiz: any) =>
          Boolean(quiz?.certificate) &&
          String(quiz.certificate).toLowerCase() !== "0" &&
          String(quiz.certificate).toLowerCase() !== "false"
        )
      : [];

  const courseCertificateStatus = courseProgress >= 100 ? "Completed" : "In Progress";

  const buildFileUrl = (source: any) => {
    const filePath =
      source?.file ||
      source?.file_path ||
      source?.link_url ||
      source?.url ||
      "";

    if (!filePath) return "";
    if (/^https?:\/\//i.test(filePath)) return filePath;

    if (filePath.startsWith("/store/")) {
      const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
      return `${apiOrigin}${filePath}`;
    }

    return resolveStorageUrl(filePath);
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, open: !s.open } : s)
    );
  };

  useEffect(() => {
    // If we have sections but no selected item, pick the first one
    if (sections.length > 0 && !selectedItem) {
      if (sections[0]?.items?.length) {
        setSelectedItem({ sectionId: sections[0].id, itemIdx: 0 });
      }
    }
  }, [sections, selectedItem]);

  const currentSection = useMemo(() =>
    sections.find((s) => s.id === selectedItem?.sectionId) || sections[0]
    , [sections, selectedItem?.sectionId]);

  const currentItem = useMemo(() =>
    currentSection?.items?.[selectedItem?.itemIdx ?? 0] || null
    , [currentSection, selectedItem?.itemIdx]);

  const assessmentSelectedSection = useMemo(
    () => sections.find((s) => s.id === selectedAssessmentSectionId) || null,
    [sections, selectedAssessmentSectionId]
  );

  const assessmentSelectedItems = getAssessmentItems(assessmentSelectedSection);
  const assessmentNoItemsSelected = panel === "assessment" && selectedAssessmentSectionId && assessmentSelectedItems.length === 0;

  const tabs = useMemo(() => [
    { key: "content" as const, label: "Content", Icon: LayoutGrid },
    { key: "assessment" as const, label: "Assessment", Icon: ClipboardList },
    { key: "certificates" as const, label: "Certificates", Icon: Award },
  ], []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-sm text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-slate-500">No course details available.</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <header className="border-b border-slate-200 bg-white flex-none">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <GlobalLearningLogoLink className="h-10 w-auto flex-none" />
          <h1 className="flex-1 text-sm md:text-base font-semibold text-slate-800 truncate min-w-0">
            {course?.title || course?.translations?.[0]?.title || course?.name || "Course Detail"}
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

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentItem?.icon === "pdf" && (
            <div className="bg-[#323639] text-white flex items-center gap-2 px-3 py-2 text-xs flex-none select-none">
              <button className="p-1 hover:bg-white/10 rounded"><Menu className="h-3.5 w-3.5" /></button>
              <span className="text-slate-300 truncate max-w-[220px]">{currentItem.title}</span>
              <button className="px-1.5 py-0.5 hover:bg-white/10 rounded ml-auto">−</button>
              <span>99%</span>
              <button className="px-1.5 py-0.5 hover:bg-white/10 rounded">+</button>
            </div>
          )}

          <div className="flex-1 overflow-hidden bg-white">
            {(() => {
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
                  <iframe
                    src={`${currentItem.fileUrl}#view=FitH`}
                    className="w-full h-full border-0"
                    title={currentItem.title || "PDF Preview"}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
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
                      <iframe
                        src={`${currentItem.fileUrl}#view=FitH`}
                        className="w-full h-full border-0"
                        title={currentItem.title || "PDF Content"}
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex-1 p-6 text-slate-600">
                        <p>File is ready for download.</p>
                        <a
                          className="text-blue-600"
                          href={currentItem.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open file in new tab
                        </a>
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

        <aside className="w-[340px] border-l border-slate-200 bg-white flex flex-col flex-none overflow-hidden">
          <div className="flex items-center border-b border-slate-200 px-4 pt-3 gap-1 flex-none">
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setPanel(key)}
                className={cn(
                  "relative flex items-center gap-1.5 pb-3 mr-4 text-sm font-medium transition-colors whitespace-nowrap",
                  panel === key
                    ? "text-slate-900 after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[#5b3fd6] after:content-['']"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-3">
            {panel === "content" && sections.map((section) => (
              <div key={section.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-[#5b3fd6] text-white flex items-center justify-center flex-none">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 leading-snug break-words">{section.title}</h3>
                      <p className="text-xs text-slate-400">{section.topicCount} Topic{section.topicCount !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  {section.open
                    ? <ChevronDown className="h-4 w-4 text-slate-400 flex-none ml-2" />
                    : <ChevronRight className="h-4 w-4 text-slate-400 flex-none ml-2" />}
                </button>

                {section.open && (
                  <div className="border-t border-slate-100 bg-slate-50/80">
                    {section.items.length === 0 && (
                      <p className="px-4 py-3 text-xs text-slate-400">No content in this unit yet.</p>
                    )}
                    {section.items.map((item: any, idx: number) => {
                      const toggleKey = `${section.id}-${idx}`;
                      const isToggled = !!readToggles[toggleKey];
                      const isSelected =
                        selectedItem?.sectionId === section.id &&
                        selectedItem?.itemIdx === idx;

                      return (
                        <div
                          key={item.id || idx}
                          className={cn(
                            "px-4 py-3 border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors",
                            isSelected
                              ? "bg-orange-50 border-l-4 border-orange-500"
                              : "hover:bg-slate-100"
                          )}
                          onClick={() => {
                            setSelectedAssessmentSectionId(null);
                            setSelectedItem({ sectionId: section.id, itemIdx: idx });
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <ItemIcon type={item.icon} />
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-semibold whitespace-normal break-words leading-snug",
                                isSelected ? "text-orange-600" : "text-slate-800"
                              )}>
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                              )}
                            </div>
                          </div>
                          {item.hasToggle && (
                            <div className="mt-2 flex items-center justify-between text-[11px] text-orange-500">
                              <span>I read this lesson</span>
                              <Switch
                                checked={isToggled}
                                onCheckedChange={(v) =>
                                  setReadToggles((prev) => ({ ...prev, [toggleKey]: v }))
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {panel === "assessment" && (
              <div className="space-y-3">
                {sections.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-6">
                    <p className="text-xs text-slate-400">No chapters available yet.</p>
                  </div>
                ) : (
                  sections.map((section, sectionIndex) => {
                    const chapterTitle = section.title || section.name || `Chapter ${sectionIndex + 1}`;
                    const assessmentItems = getAssessmentItems(section);

                    const firstAssessmentIndex = (section.items || []).findIndex((item: any) => item.icon === "quiz" || item.icon === "file");

                    return (
                      <div
                        key={section.id || sectionIndex}
                        className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 cursor-pointer"
                        onClick={() => {
                          setSelectedAssessmentSectionId(section.id || null);
                          if (firstAssessmentIndex >= 0) {
                            setSelectedItem({ sectionId: section.id, itemIdx: firstAssessmentIndex });
                          } else {
                            setSelectedItem(null);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">Chapter {sectionIndex + 1}: {chapterTitle}</h3>
                            <p className="text-xs text-slate-500">{section.topicCount ?? (section.items?.length ?? 0)} topic{(section.topicCount ?? section.items?.length ?? 0) === 1 ? "" : "s"}</p>
                          </div>
                        </div>

                        {assessmentItems.length > 0 ? (
                          <ul className="mt-3 space-y-1 text-xs text-slate-600">
                            {assessmentItems.map((item: any, idx: number) => {
                              const absoluteItemIndex = (section.items || []).findIndex((i: any) => i === item);
                              const isActive = selectedItem?.sectionId === section.id && selectedItem?.itemIdx === absoluteItemIndex;

                              return (
                                <li
                                  key={item.id || idx}
                                  className={cn("cursor-pointer px-2 py-1 rounded", isActive ? "bg-orange-50 text-orange-700" : "hover:bg-slate-100")}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedAssessmentSectionId(section.id || null);
                                    setSelectedItem({ sectionId: section.id, itemIdx: absoluteItemIndex });
                                  }}
                                >
                                  {item.title || item.name || "Assessment item"} ({item.icon})
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="mt-3 text-xs text-slate-400">No assessment items in this chapter.</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {panel === "certificates" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-6">
                {!courseHasCertificate ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-slate-800">No Certificate!</h3>
                    <p className="text-sm text-slate-500 mt-2">This course doesn't include any certificates.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Certificate details</h3>
                      <p className="text-xs text-slate-500">Data from course API is shown here dynamically.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                      <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Course certificate setting</span>
                          <span className="font-semibold text-emerald-600">Enabled</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">course.certificate: {course?.certificate ?? "n/a"}</p>
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Progress</span>
                          <span className="font-semibold">{courseProgress}%</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Certificate status: {courseCertificateStatus}</p>
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Quiz certificates</span>
                          <span className="font-semibold">{courseCertificateEnabledQuizzes.length}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {courseCertificateEnabledQuizzes.length > 0
                            ? courseCertificateEnabledQuizzes.map((quiz: any) => quiz.title || `Quiz ${quiz.id}`).join(", ")
                            : "No quiz certificates configured."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-800">Course certificate available</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {courseCertificateStatus === "Completed"
                          ? "You have completed this course and are eligible for a certificate."
                          : "Complete all lessons to generate a certificate."
                        }
                      </p>
                      {courseCertificateStatus === "Completed" && (
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            window.open("/certificates", "_blank");
                          }}
                        >
                          View your certificate
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {currentItem?.icon === "pdf" && currentItem?.fileUrl && (
        <div className="border-t bg-white px-6 py-3 flex items-center justify-between flex-none">
          <span className="text-sm font-medium text-slate-700">Download the file</span>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
            <a href={currentItem.fileUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
