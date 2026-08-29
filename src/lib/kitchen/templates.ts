import { createComponent, newId } from "./catalog";
import type { Design, KComponent } from "./types";

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  build: (wall: { width: number; height: number }) => KComponent[];
}

const c = createComponent;

function run(width: number, y: number, items: [Parameters<typeof c>[0], number][], startX = 0) {
  let x = startX;
  const out: KComponent[] = [];
  for (const [type, w] of items) {
    if (x + w > width) break;
    out.push(c(type, { x, y, w }));
    x += w;
  }
  return out;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "blank",
    name: "Blank canvas",
    description: "An empty wall. Start from nothing.",
    build: () => [],
  },
  {
    id: "compact",
    name: "Compact kitchen",
    description: "Efficient run for tight walls: sink, range, minimal storage.",
    build: ({ width }) => {
      const base = run(width, 0, [
        ["base-cabinet", 24],
        ["range", 30],
        ["base-cabinet", 24],
      ]);
      const usedRun = base.reduce((s, b) => s + b.w, 0);
      return [
        ...base,
        c("countertop", { x: 0, y: 34.5, w: Math.min(usedRun, width) }),
        c("sink", { x: 6, y: 26, w: 24 }),
        c("upper-cabinet", { x: 0, y: 54, w: 24, h: 30 }),
        c("range-hood", { x: 24, y: 66, w: 30 }),
        c("open-shelving", { x: 56, y: 56, w: Math.max(18, Math.min(30, width - 58)) }),
      ];
    },
  },
  {
    id: "standard",
    name: "Standard kitchen",
    description: "The classic arrangement: fridge, range, sink run, uppers.",
    build: ({ width }) => {
      const base = run(width, 0, [
        ["refrigerator", 33],
        ["base-cabinet", 30],
        ["range", 30],
        ["drawer-cabinet", 24],
        ["dishwasher", 24],
      ]);
      const counterStart = 33;
      const counterW = Math.max(24, Math.min(width - counterStart, 108));
      return [
        ...base,
        c("countertop", { x: counterStart, y: 34.5, w: counterW }),
        c("sink", { x: counterStart + 4, y: 26, w: 26 }),
        c("upper-cabinet", { x: 33, y: 54, w: 30 }),
        c("range-hood", { x: 63, y: 66, w: 30 }),
        c("upper-cabinet", { x: 93, y: 54, w: Math.max(12, Math.min(30, width - 95)) }),
        c("pendant", { x: counterStart + 12, y: 76, w: 12 }),
      ];
    },
  },
  {
    id: "appliance",
    name: "Appliance-forward",
    description: "Full appliance suite with wall oven and hood.",
    build: ({ width }) => {
      const base = run(width, 0, [
        ["refrigerator", 36],
        ["tall-cabinet", 30],
        ["range", 36],
        ["dishwasher", 24],
        ["base-cabinet", 24],
      ]);
      const counterStart = 102;
      return [
        ...base,
        c("oven", { x: 36, y: 32, w: 30, h: 28 }),
        c("countertop", { x: counterStart, y: 34.5, w: Math.max(24, width - counterStart) }),
        c("sink", { x: counterStart + 6, y: 26, w: 26 }),
        c("range-hood", { x: 66, y: 70, w: 36, h: 24 }),
        c("microwave", { x: 36, y: 62, w: 30 }),
      ];
    },
  },
  {
    id: "storage",
    name: "Storage-forward",
    description: "Maximum cabinetry with pantry and full upper run.",
    build: ({ width }) => {
      const base = run(width, 0, [
        ["tall-cabinet", 30],
        ["drawer-cabinet", 24],
        ["base-cabinet", 30],
        ["base-cabinet", 30],
        ["drawer-cabinet", 24],
      ]);
      const uppers = run(width, 54, [
        ["upper-cabinet", 30],
        ["upper-cabinet", 30],
        ["upper-cabinet", 30],
        ["upper-cabinet", 30],
      ], 30);
      return [
        ...base,
        ...uppers,
        c("countertop", { x: 30, y: 34.5, w: Math.max(24, width - 30) }),
        c("sink", { x: 40, y: 26, w: 26 }),
      ];
    },
  },
  {
    id: "balanced",
    name: "Balanced kitchen",
    description: "Storage, appliances, and open shelving in equal measure.",
    build: ({ width }) => {
      const base = run(width, 0, [
        ["base-cabinet", 30],
        ["range", 30],
        ["drawer-cabinet", 24],
        ["dishwasher", 24],
        ["refrigerator", 33],
      ]);
      return [
        ...base,
        c("countertop", { x: 0, y: 34.5, w: Math.min(108, width) }),
        c("sink", { x: 88, y: 26, w: 26 }),
        c("upper-cabinet", { x: 0, y: 54, w: 30 }),
        c("range-hood", { x: 30, y: 66, w: 30 }),
        c("open-shelving", { x: 60, y: 56, w: Math.max(18, Math.min(48, width - 100)) }),
        c("plant", { x: 66, y: 36, w: 12, h: 16 }),
        c("pendant", { x: 92, y: 76, w: 12 }),
      ];
    },
  },
];

export function createDesign(
  name: string,
  wall: { width: number; height: number },
  templateId: string,
): Design {
  const tpl = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const now = new Date().toISOString();
  return {
    version: 1,
    id: newId("d"),
    name,
    wall,
    components: tpl.build(wall).filter((k) => k.x + k.w <= wall.width && k.y + k.h <= wall.height),
    groups: [],
    settings: { grid: true, snap: true, gridSize: 3, background: "gray" },
    palette: null,
    createdAt: now,
    updatedAt: now,
  };
}
