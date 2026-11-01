import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import PdfLesson from "./PdfLesson";
import { exportLessonPdf } from "../../utils/pdfExport";

export default function LessonPdfExporter({ courseTitle, moduleTitle, lesson }) {
  const printRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    if (busy || !printRef.current) return;
    setBusy(true);
    setError("");
    try {
      await exportLessonPdf(printRef.current, { filename: `${courseTitle}-${lesson.title}` });
    } catch (err) {
      console.error("[pdf]", err);
      setError("Could not create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={download}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {busy ? "Preparing PDF..." : "Download PDF"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Off-screen print version, always light, same look on every theme */}
      <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
        <div ref={printRef} data-pdf-root>
          <PdfLesson
            courseTitle={courseTitle}
            moduleTitle={moduleTitle}
            lessonTitle={lesson.title}
            objectives={lesson.objectives}
            content={lesson.content}
          />
        </div>
      </div>
    </>
  );
}