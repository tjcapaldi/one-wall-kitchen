import { CATALOG } from "./catalog";
import { costEstimate } from "./estimate";
import { inchLabel, money, toFeetInches } from "./format";
import { downloadBlob, slugify } from "./storage";
import type { Design } from "./types";

const CSS_VARS = [
  "--drawing-wall",
  "--drawing-grid",
  "--drawing-ink",
  "--drawing-select",
  "--drawing-guide",
  "--paper",
  "--ink",
];

/** Clone the live canvas SVG, resolve CSS variables and inline fonts. */
function prepareSvg(): { svg: SVGSVGElement; width: number; height: number } {
  const source = document.getElementById("owk-canvas") as SVGSVGElement | null;
  if (!source) throw new Error("canvas-missing");
  const styles = getComputedStyle(source);
  const resolved = new Map<string, string>();
  for (const v of CSS_VARS) resolved.set(v, styles.getPropertyValue(v).trim() || "#1b1b1a");

  const clone = source.cloneNode(true) as SVGSVGElement;
  // drop selection chrome and guides from the exported drawing
  clone.querySelectorAll("[data-export-hide]").forEach((n) => n.remove());
  clone.querySelectorAll("*").forEach((node) => {
    for (const attr of Array.from((node as Element).attributes)) {
      if (attr.value.includes("var(--")) {
        attr.value = attr.value.replace(/var\((--[a-z-]+)\)/g, (_m, name) => resolved.get(name) ?? "#1b1b1a");
      }
    }
    if ((node as Element).tagName === "text") {
      (node as SVGTextElement).setAttribute("font-family", "Inter, Helvetica, Arial, sans-serif");
    }
  });

  const vb = (source.getAttribute("viewBox") ?? "0 0 100 100").split(" ").map(Number);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const scale = 6;
  const width = Math.round(vb[2] * scale);
  const height = Math.round(vb[3] * scale);
  clone.setAttribute("width", `${width}`);
  clone.setAttribute("height", `${height}`);
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", `${vb[0]}`);
  bg.setAttribute("y", `${vb[1]}`);
  bg.setAttribute("width", `${vb[2]}`);
  bg.setAttribute("height", `${vb[3]}`);
  bg.setAttribute("fill", resolved.get("--paper") ?? "#ffffff");
  clone.insertBefore(bg, clone.firstChild);
  return { svg: clone, width, height };
}

export async function renderCanvasPng(): Promise<{ dataUrl: string; width: number; height: number }> {
  const { svg, width, height } = prepareSvg();
  const xml = new XMLSerializer().serializeToString(svg);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("render-failed"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("render-failed");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return { dataUrl: canvas.toDataURL("image/png"), width, height };
}

export async function exportPng(design: Design) {
  const { dataUrl } = await renderCanvasPng();
  const blob = await (await fetch(dataUrl)).blob();
  downloadBlob(blob, `${slugify(design.name)}.png`);
}

export function exportJson(design: Design) {
  const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${slugify(design.name)}.json`);
}

export async function exportPdf(design: Design) {
  const { jsPDF } = await import("jspdf");
  const { dataUrl, width, height } = await renderCanvasPng();
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 46;

  doc.setFont("times", "normal");
  doc.setFontSize(24);
  doc.text("One Wall Kitchen", margin, margin + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(design.name, margin, margin + 26);
  doc.text(
    `Wall ${toFeetInches(design.wall.width)} × ${toFeetInches(design.wall.height)}   ·   ${new Date().toLocaleDateString()}`,
    pageW - margin,
    margin + 26,
    { align: "right" },
  );
  doc.setDrawColor(200);
  doc.line(margin, margin + 38, pageW - margin, margin + 38);

  const drawW = pageW - margin * 2;
  const drawH = Math.min((drawW * height) / width, pageH * 0.52);
  const scaledW = (drawH * width) / height;
  doc.addImage(dataUrl, "PNG", margin + (drawW - scaledW) / 2, margin + 56, scaledW, drawH);

  let y = margin + 70 + drawH;
  doc.setTextColor(30);
  doc.setFontSize(9);
  doc.text("Schedule of components", margin, y);
  y += 14;
  doc.setTextColor(110);
  doc.text("Component", margin, y);
  doc.text("Size (in)", margin + 190, y);
  doc.text("Position (from left / floor)", margin + 280, y);
  doc.setTextColor(40);
  y += 4;
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  const rows = design.components.slice(0, 16);
  for (const c of rows) {
    if (y > pageH - margin - 40) break;
    doc.text(CATALOG[c.type].label, margin, y);
    doc.text(`${inchLabel(c.w)} × ${inchLabel(c.h)}`, margin + 190, y);
    doc.text(`${inchLabel(c.x)} / ${inchLabel(c.y)}`, margin + 280, y);
    y += 12;
  }
  if (design.components.length > rows.length) {
    doc.setTextColor(130);
    doc.text(`+ ${design.components.length - rows.length} more components`, margin, y);
  }

  const est = costEstimate(design);
  doc.setTextColor(110);
  doc.setFontSize(8);
  doc.text(
    `Estimated materials ${money(est.materialTotal)} · estimated install ${money(est.laborLow)}–${money(est.laborHigh)} · estimates only, not a quote.`,
    margin,
    pageH - margin + 12,
  );

  doc.save(`${slugify(design.name)}.pdf`);
}
