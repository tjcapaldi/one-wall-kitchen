import type { Design } from "./types";
import { CATALOG } from "./catalog";

const KEY = "one-wall-kitchen:design";
const APPEARANCE_KEY = "one-wall-kitchen:appearance";

export function saveDesign(design: Design) {
  if (typeof window === "undefined") return;
  const payload: Design = { ...design, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(payload));
}

export function loadDesign(): Design | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return validateDesign(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearDesign() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

export function savedDesignMeta(): { name: string; updatedAt: string } | null {
  const d = loadDesign();
  return d ? { name: d.name, updatedAt: d.updatedAt } : null;
}

export function loadAppearance(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(APPEARANCE_KEY);
}

export function saveAppearance(id: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(APPEARANCE_KEY, id);
}

class ImportError extends Error {}

/** Throws ImportError with a human message when the file isn't a valid design. */
export function validateDesign(input: unknown): Design {
  const fail = (msg: string) => {
    throw new ImportError(msg);
  };
  if (!input || typeof input !== "object") fail("That file doesn't contain a design.");
  const d = input as Partial<Design>;
  if (!d.wall || typeof d.wall.width !== "number" || typeof d.wall.height !== "number")
    fail("This design file is missing its wall dimensions.");
  if (!Array.isArray(d.components)) fail("This design file is missing its components.");

  const components = (d.components as Design["components"])
    .filter((c) => c && typeof c === "object" && typeof c.type === "string" && c.type in CATALOG)
    .map((c, i) => ({
      id: typeof c.id === "string" ? c.id : `imported_${i}`,
      type: c.type,
      x: num(c.x, 0),
      y: num(c.y, 0),
      w: num(c.w, CATALOG[c.type].w),
      h: num(c.h, CATALOG[c.type].h),
      depth: num(c.depth, CATALOG[c.type].depth),
      finish: c.finish ?? CATALOG[c.type].finish,
      doorStyle: c.doorStyle ?? CATALOG[c.type].doorStyle,
      hardware: c.hardware ?? CATALOG[c.type].hardware,
      groupId: c.groupId ?? null,
    }));

  if (!components.length && (d.components as unknown[]).length)
    fail("None of the components in this file are recognised.");

  const now = new Date().toISOString();
  return {
    version: 1,
    id: typeof d.id === "string" ? d.id : `imported_${Date.now().toString(36)}`,
    name: typeof d.name === "string" && d.name.trim() ? d.name : "Imported design",
    wall: {
      width: clamp(d.wall.width, 36, 480),
      height: clamp(d.wall.height, 72, 180),
    },
    components,
    groups: Array.isArray(d.groups)
      ? d.groups.filter((g) => g && typeof g.id === "string").map((g) => ({ id: g.id, name: g.name ?? "Group" }))
      : [],
    settings: {
      grid: d.settings?.grid ?? true,
      snap: d.settings?.snap ?? true,
      gridSize: num(d.settings?.gridSize, 3),
      background: d.settings?.background ?? "gray",
    },
    palette: d.palette ?? null,
    createdAt: typeof d.createdAt === "string" ? d.createdAt : now,
    updatedAt: now,
  };
}

function num(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "design";
}
