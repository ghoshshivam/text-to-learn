const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const MARGIN_Y_MM = 12;

function computeBreaks(blocks, totalHeight, pageHeight) {
  const pages = [];
  let start = 0;
  while (start < totalHeight - 1) {
    const limit = start + pageHeight;
    if (limit >= totalHeight) {
      pages.push([start, totalHeight]);
      break;
    }
    let idx = blocks.findIndex((b) => b.bottom > limit);
    while (idx > 0 && blocks[idx - 1].keep && blocks[idx - 1].top > start + 40) idx--;
    const next = idx >= 0 ? blocks[idx] : null;
    const end = next && next.top > start + 40 ? next.top : limit;
    pages.push([start, end]);
    start = end;
  }
  return pages;
}

const fileSafe = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "lesson";

export async function exportLessonPdf(element, { filename }) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  if (document.fonts?.ready) await document.fonts.ready;

  const rootRect = element.getBoundingClientRect();
  const rootTop = rootRect.top;
  const rootLeft = rootRect.left;

  // 1. Measure layout blocks for page breaks
  const blocks = Array.from(element.children).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      top: r.top - rootTop,
      bottom: r.bottom - rootTop,
      keep: el.hasAttribute("data-keep"),
    };
  });

  // 2. Measure links for clickable annotations
  const linkElements = Array.from(element.querySelectorAll("[data-pdf-link]"));
  const links = linkElements.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      url: el.getAttribute("data-pdf-link"),
      x: r.left - rootLeft,
      y: r.top - rootTop,
      w: r.width,
      h: r.height,
    };
  });

  const totalHeight = element.offsetHeight;
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    onclone: (doc) => {
      const node = doc.querySelector("[data-pdf-root]");
      if (node?.parentElement) {
        node.parentElement.style.position = "static";
        node.parentElement.style.left = "0";
      }
    },
  });

  const scale = canvas.width / element.offsetWidth;
  const mmPerPx = PAGE_W_MM / element.offsetWidth;
  const pageHeightPx = (PAGE_H_MM - MARGIN_Y_MM * 2) / mmPerPx;
  const pages = computeBreaks(blocks, totalHeight, pageHeightPx);

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });

  pages.forEach(([start, end], i) => {
    if (i > 0) pdf.addPage();
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.max(1, Math.round((end - start) * scale));
    const ctx = slice.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      canvas,
      0,
      Math.round(start * scale),
      canvas.width,
      slice.height,
      0,
      0,
      slice.width,
      slice.height
    );

    const sliceHeightMm = (end - start) * mmPerPx;
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.95),
      "JPEG",
      0,
      MARGIN_Y_MM,
      PAGE_W_MM,
      sliceHeightMm
    );

    // Add clickable PDF link hotspots falling inside this page slice
    links.forEach((l) => {
      if (l.y >= start && l.y < end) {
        const xMm = l.x * mmPerPx;
        const yMm = MARGIN_Y_MM + (l.y - start) * mmPerPx;
        const wMm = l.w * mmPerPx;
        const hMm = l.h * mmPerPx;
        pdf.link(xMm, yMm, wMm, hMm, { url: l.url });
      }
    });
  });

  // Footer page numbers
  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text("Text-to-Learn", 12, PAGE_H_MM - 6);
    pdf.text(`Page ${p} of ${total}`, PAGE_W_MM - 12, PAGE_H_MM - 6, { align: "right" });
  }

  pdf.save(`${fileSafe(filename)}.pdf`);
}