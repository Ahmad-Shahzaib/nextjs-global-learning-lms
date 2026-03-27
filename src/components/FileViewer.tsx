// InlinePdfViewer: simple PDF iframe viewer for external use
export function InlinePdfViewer({ url }: { url: string }) {
  return (
    <iframe
      src={`${url}#view=FitH`}
      className="w-full h-full border-0"
      title="PDF Preview"
      allow="autoplay; fullscreen"
      allowFullScreen
    />
  );
}
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

// Static file data matching client screenshot
const STATIC_FILE = {
  title: "Assessment Brief",
  subtitle: "pdf | 0.49 MB",
  file_type: "application/pdf",
  // Use a publicly accessible PDF for demo; replace with your actual file path
  file_path: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf",
};

export function FileViewer() {
  const file = STATIC_FILE;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top bar with title + download */}
      <div className="p-4 border-b flex items-center justify-between bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* File icon circle */}
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{file.title}</p>
            <p className="text-xs text-slate-400">{file.subtitle}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={file.file_path} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
      </div>

      {/* "I read this lesson" toggle row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white">
        <span className="text-xs text-orange-500 font-medium">I read this lesson</span>
        <Switch />
      </div>

      {/* PDF Iframe viewer */}
      <div className="flex-1 overflow-hidden relative bg-slate-800">
        <iframe
          src={`${file.file_path}#view=FitH`}
          className="w-full h-full border-0"
          title={`Preview of ${file.title}`}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Bottom download bar */}
      <div className="border-t bg-white p-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Download the file</span>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <a href={file.file_path} download target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </Button>
      </div>
    </div>
  );
}