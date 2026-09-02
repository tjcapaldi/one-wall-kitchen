import type { FinishId, Palette } from "./types";

export interface StyleDirection {
  id: string;
  name: string;
  summary: string;
  materials: string[];
  palette: Palette;
}

const p = (
  name: string,
  description: string,
  finishes: { role: string; finish: FinishId; note: string }[],
): Palette => ({ name, description, finishes });

export const STYLE_DIRECTIONS: StyleDirection[] = [
  {
    id: "warm-minimal",
    name: "Warm Minimal",
    summary:
      "Quiet slab fronts in bone white, warmed by a single oak gesture. Hardware nearly disappears.",
    materials: ["Matte lacquer slab fronts", "Honed limestone counter", "White oak shelving", "Brushed brass edge pulls"],
    palette: p("Warm Minimal", "Bone white cabinetry, oak accents, stone counters.", [
      { role: "Cabinets", finish: "off-white", note: "Slab fronts, matte" },
      { role: "Countertop", finish: "marble", note: "Honed, light vein" },
      { role: "Shelving", finish: "light-oak", note: "Solid oak, oiled" },
      { role: "Appliances", finish: "stainless", note: "Brushed, unpolished" },
    ]),
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    summary: "Pale wood, white walls, and daylight. Nothing decorative that isn't useful.",
    materials: ["Painted shaker fronts", "Ash worktop", "Ceramic tile backsplash", "Simple wood knobs"],
    palette: p("Scandinavian", "White fronts, ash tones, soft grey stone.", [
      { role: "Cabinets", finish: "white", note: "Shaker, eggshell" },
      { role: "Countertop", finish: "light-oak", note: "Solid ash, oiled" },
      { role: "Shelving", finish: "white", note: "Painted to match wall" },
      { role: "Appliances", finish: "white", note: "Integrated where possible" },
    ]),
  },
  {
    id: "modern-traditional",
    name: "Modern Traditional",
    summary: "Panelled fronts and graphite lowers with a crisp white upper register.",
    materials: ["Inset panel doors", "Soapstone counter", "Unlacquered brass hardware", "Zellige backsplash"],
    palette: p("Modern Traditional", "Graphite base, white uppers, stone counter.", [
      { role: "Base cabinets", finish: "graphite", note: "Panel doors" },
      { role: "Upper cabinets", finish: "white", note: "Panel doors" },
      { role: "Countertop", finish: "concrete", note: "Soapstone-look" },
      { role: "Appliances", finish: "stainless", note: "Classic pro style" },
    ]),
  },
  {
    id: "natural",
    name: "Natural",
    summary: "Clay, walnut, and plaster. A kitchen that reads as furniture, not as equipment.",
    materials: ["Walnut veneer fronts", "Clay plaster walls", "Terracotta accents", "Leather pulls"],
    palette: p("Natural", "Clay and walnut with warm neutral stone.", [
      { role: "Base cabinets", finish: "walnut", note: "Vertical grain" },
      { role: "Upper cabinets", finish: "clay", note: "Limewash finish" },
      { role: "Countertop", finish: "concrete", note: "Sealed, matte" },
      { role: "Appliances", finish: "graphite", note: "Low contrast" },
    ]),
  },
  {
    id: "contemporary",
    name: "Contemporary",
    summary: "Handleless black and stainless. Precise, flat, and deliberately reduced.",
    materials: ["Handleless slab fronts", "Stainless worktop", "Integrated appliances", "Matte black trim"],
    palette: p("Contemporary", "Black cabinetry with stainless and pale stone.", [
      { role: "Base cabinets", finish: "black", note: "Handleless slab" },
      { role: "Upper cabinets", finish: "graphite", note: "Push-to-open" },
      { role: "Countertop", finish: "stainless", note: "Brushed" },
      { role: "Appliances", finish: "stainless", note: "Fully integrated" },
    ]),
  },
];

export function styleById(id: string) {
  return STYLE_DIRECTIONS.find((s) => s.id === id) ?? STYLE_DIRECTIONS[0];
}

/** Palette variants per style: the base palette plus a cooler and a deeper reading. */
const COOL: Partial<Record<FinishId, FinishId>> = {
  "off-white": "white",
  white: "off-white",
  "light-oak": "marble",
  walnut: "concrete",
  clay: "concrete",
  marble: "concrete",
  concrete: "marble",
  stainless: "concrete",
  graphite: "stainless",
  black: "graphite",
};

const DEEP: Partial<Record<FinishId, FinishId>> = {
  "off-white": "concrete",
  white: "concrete",
  marble: "clay",
  "light-oak": "walnut",
  clay: "walnut",
  concrete: "graphite",
  stainless: "graphite",
  walnut: "graphite",
  graphite: "black",
  black: "black",
};

function variant(base: Palette, name: string, description: string, map: Partial<Record<FinishId, FinishId>>): Palette {
  return {
    name,
    description,
    finishes: base.finishes.map((f) => ({ ...f, finish: map[f.finish] ?? f.finish })),
  };
}

export function palettesFor(style: StyleDirection): Palette[] {
  return [
    style.palette,
    variant(style.palette, `${style.name} · Cool`, "Cooler, flatter tones — more daylight, less warmth.", COOL),
    variant(style.palette, `${style.name} · Deep`, "Darker register — heavier base, more contrast.", DEEP),
  ];
}

export const CUSTOM_STYLE_ID = "custom";

export const CUSTOM_ROLES = [
  "Base cabinets",
  "Upper cabinets",
  "Countertop",
  "Shelving",
  "Appliances",
] as const;

export function customStyle(finishes: Record<string, FinishId>): StyleDirection {
  return {
    id: CUSTOM_STYLE_ID,
    name: "Custom",
    summary: "Your own combination — pick a tone for each role and apply it to the drawing.",
    materials: ["Chosen by you", "Anything the roles below imply"],
    palette: p("Custom palette", "Hand-picked tones per role.", CUSTOM_ROLES.map((role) => ({
      role,
      finish: finishes[role] ?? "off-white",
      note: "Your choice",
    }))),
  };
}
