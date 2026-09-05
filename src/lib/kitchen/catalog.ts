import type {
  CategoryId,
  ComponentType,
  DoorStyleId,
  FinishId,
  HardwareId,
  KComponent,
} from "./types";

export interface CatalogEntry {
  type: ComponentType;
  label: string;
  category: CategoryId;
  /** default size in inches */
  w: number;
  h: number;
  depth: number;
  min: { w: number; h: number };
  max: { w: number; h: number };
  /** default distance from floor, inches. `null` = place on floor */
  defaultY: number;
  finish: FinishId;
  doorStyle?: DoorStyleId;
  hardware?: HardwareId;
  resizable: { w: boolean; h: boolean };
  /** unit price used for estimates. per linear foot when perFoot is true */
  price: number;
  perFoot?: boolean;
  laborHours: number;
  note?: string;
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "cabinets", label: "Cabinets & Shelving" },
  { id: "countertops", label: "Countertops" },
  { id: "appliances", label: "Appliances" },
  { id: "openings", label: "Windows & Doors" },
  { id: "decor", label: "Decor" },
];

export const CATALOG: Record<ComponentType, CatalogEntry> = {
  "base-cabinet": {
    type: "base-cabinet",
    label: "Base cabinet",
    category: "cabinets",
    w: 30,
    h: 34.5,
    depth: 24,
    min: { w: 12, h: 30 },
    max: { w: 48, h: 36 },
    defaultY: 0,
    finish: "white",
    doorStyle: "shaker",
    hardware: "knob",
    resizable: { w: true, h: true },
    price: 210,
    perFoot: true,
    laborHours: 1.5,
  },
  "drawer-cabinet": {
    type: "drawer-cabinet",
    label: "Drawer cabinet",
    category: "cabinets",
    w: 24,
    h: 34.5,
    depth: 24,
    min: { w: 12, h: 30 },
    max: { w: 42, h: 36 },
    defaultY: 0,
    finish: "white",
    doorStyle: "slab",
    hardware: "pull",
    resizable: { w: true, h: true },
    price: 265,
    perFoot: true,
    laborHours: 1.75,
  },
  "upper-cabinet": {
    type: "upper-cabinet",
    label: "Upper cabinet",
    category: "cabinets",
    w: 30,
    h: 30,
    depth: 12,
    min: { w: 12, h: 12 },
    max: { w: 48, h: 42 },
    defaultY: 54,
    finish: "white",
    doorStyle: "shaker",
    hardware: "knob",
    resizable: { w: true, h: true },
    price: 175,
    perFoot: true,
    laborHours: 1.5,
  },
  "tall-cabinet": {
    type: "tall-cabinet",
    label: "Tall cabinet / pantry",
    category: "cabinets",
    w: 24,
    h: 84,
    depth: 24,
    min: { w: 18, h: 60 },
    max: { w: 36, h: 96 },
    defaultY: 0,
    finish: "white",
    doorStyle: "panel",
    hardware: "pull",
    resizable: { w: true, h: true },
    price: 420,
    perFoot: true,
    laborHours: 2.5,
  },
  "open-shelving": {
    type: "open-shelving",
    label: "Open shelving",
    category: "cabinets",
    w: 36,
    h: 24,
    depth: 10,
    min: { w: 18, h: 8 },
    max: { w: 72, h: 42 },
    defaultY: 56,
    finish: "light-oak",
    resizable: { w: true, h: true },
    price: 95,
    perFoot: true,
    laborHours: 0.75,
  },
  countertop: {
    type: "countertop",
    label: "Countertop",
    category: "countertops",
    w: 60,
    h: 1.5,
    depth: 25,
    min: { w: 18, h: 1 },
    max: { w: 168, h: 3 },
    defaultY: 34.5,
    finish: "concrete",
    resizable: { w: true, h: true },
    price: 78,
    perFoot: true,
    laborHours: 1.5,
  },
  refrigerator: {
    type: "refrigerator",
    label: "Refrigerator",
    category: "appliances",
    w: 33,
    h: 69,
    depth: 30,
    min: { w: 24, h: 60 },
    max: { w: 42, h: 84 },
    defaultY: 0,
    finish: "stainless",
    hardware: "bar",
    resizable: { w: true, h: true },
    price: 1850,
    laborHours: 1,
  },
  range: {
    type: "range",
    label: "Range",
    category: "appliances",
    w: 30,
    h: 36,
    depth: 26,
    min: { w: 24, h: 34 },
    max: { w: 48, h: 38 },
    defaultY: 0,
    finish: "stainless",
    hardware: "bar",
    resizable: { w: true, h: false },
    price: 1450,
    laborHours: 1.5,
  },
  oven: {
    type: "oven",
    label: "Wall oven",
    category: "appliances",
    w: 30,
    h: 28,
    depth: 24,
    min: { w: 24, h: 24 },
    max: { w: 36, h: 50 },
    defaultY: 30,
    finish: "stainless",
    hardware: "bar",
    resizable: { w: true, h: true },
    price: 1650,
    laborHours: 2,
  },
  dishwasher: {
    type: "dishwasher",
    label: "Dishwasher",
    category: "appliances",
    w: 24,
    h: 34,
    depth: 24,
    min: { w: 18, h: 32 },
    max: { w: 24, h: 35 },
    defaultY: 0,
    finish: "stainless",
    hardware: "bar",
    resizable: { w: true, h: false },
    price: 780,
    laborHours: 2,
  },
  microwave: {
    type: "microwave",
    label: "Microwave",
    category: "appliances",
    w: 30,
    h: 17,
    depth: 15,
    min: { w: 20, h: 12 },
    max: { w: 36, h: 22 },
    defaultY: 54,
    finish: "stainless",
    hardware: "bar",
    resizable: { w: true, h: true },
    price: 420,
    laborHours: 1,
  },
  "range-hood": {
    type: "range-hood",
    label: "Range hood",
    category: "appliances",
    w: 30,
    h: 20,
    depth: 20,
    min: { w: 24, h: 12 },
    max: { w: 48, h: 36 },
    defaultY: 66,
    finish: "stainless",
    resizable: { w: true, h: true },
    price: 690,
    laborHours: 1.5,
  },
  window: {
    type: "window",
    label: "Window",
    category: "openings",
    w: 36,
    h: 42,
    depth: 0,
    min: { w: 18, h: 18 },
    max: { w: 84, h: 72 },
    defaultY: 42,
    finish: "white",
    resizable: { w: true, h: true },
    price: 0,
    laborHours: 0,
    note: "Existing opening",
  },
  door: {
    type: "door",
    label: "Door / opening",
    category: "openings",
    w: 34,
    h: 80,
    depth: 0,
    min: { w: 24, h: 72 },
    max: { w: 60, h: 96 },
    defaultY: 0,
    finish: "white",
    hardware: "knob",
    resizable: { w: true, h: true },
    price: 0,
    laborHours: 0,
    note: "Existing opening",
  },
  sink: {
    type: "sink",
    label: "Sink",
    category: "decor",
    w: 30,
    h: 9,
    depth: 22,
    min: { w: 18, h: 6 },
    max: { w: 42, h: 12 },
    defaultY: 26,
    finish: "stainless",
    hardware: "bar",
    resizable: { w: true, h: true },
    price: 540,
    laborHours: 2.5,
  },
  pendant: {
    type: "pendant",
    label: "Pendant light",
    category: "decor",
    w: 12,
    h: 26,
    depth: 12,
    min: { w: 6, h: 10 },
    max: { w: 24, h: 48 },
    defaultY: 74,
    finish: "black",
    resizable: { w: true, h: true },
    price: 180,
    laborHours: 1,
  },
  plant: {
    type: "plant",
    label: "Plant",
    category: "decor",
    w: 14,
    h: 20,
    depth: 14,
    min: { w: 6, h: 8 },
    max: { w: 30, h: 48 },
    defaultY: 36,
    finish: "clay",
    resizable: { w: true, h: true },
    price: 45,
    laborHours: 0,
  },
  "decor-object": {
    type: "decor-object",
    label: "Object",
    category: "decor",
    w: 8,
    h: 10,
    depth: 8,
    min: { w: 4, h: 4 },
    max: { w: 20, h: 24 },
    defaultY: 36,
    finish: "off-white",
    resizable: { w: true, h: true },
    price: 30,
    laborHours: 0,
  },
  stool: {
    type: "stool",
    label: "Stool",
    category: "decor",
    w: 16,
    h: 26,
    depth: 16,
    min: { w: 10, h: 18 },
    max: { w: 24, h: 32 },
    defaultY: 0,
    finish: "light-oak",
    resizable: { w: true, h: true },
    price: 120,
    laborHours: 0,
  },
};

/**
 * The 2D drawing is strictly grayscale. These are tonal values only — never
 * colours. Material/colour choices live exclusively in the Visualize workflow.
 */
export const FINISHES: {
  id: FinishId;
  label: string;
  fill: string;
  line: string;
  ink: string;
}[] = [
  { id: "white", label: "White", fill: "#ffffff", line: "#1b1b1a", ink: "#1b1b1a" },
  { id: "off-white", label: "Paper", fill: "#f7f7f6", line: "#1b1b1a", ink: "#1b1b1a" },
  { id: "concrete", label: "Light grey", fill: "#dedede", line: "#1b1b1a", ink: "#1b1b1a" },
  { id: "marble", label: "Pale grey", fill: "#ededed", line: "#1b1b1a", ink: "#1b1b1a" },
  { id: "light-oak", label: "Grey 15", fill: "#e2e2e2", line: "#1b1b1a", ink: "#1b1b1a" },
  { id: "walnut", label: "Grey 30", fill: "#bcbcbc", line: "#1b1b1a", ink: "#1b1b1a" },
  { id: "clay", label: "Grey 20", fill: "#cccccc", line: "#1b1b1a", ink: "#1b1b1a" },
  { id: "stainless", label: "Grey 25", fill: "#d2d2d2", line: "#1b1b1a", ink: "#1b1b1a" },
  { id: "graphite", label: "Grey 55", fill: "#7d7d7d", line: "#161616", ink: "#f6f5f2" },
  { id: "black", label: "Black", fill: "#1f1f1e", line: "#111110", ink: "#f6f5f2" },
];

export const DOOR_STYLES: { id: DoorStyleId; label: string }[] = [
  { id: "slab", label: "Slab" },
  { id: "shaker", label: "Shaker" },
  { id: "panel", label: "Panel" },
  { id: "glass", label: "Glass" },
];

export const HARDWARE: { id: HardwareId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "knob", label: "Knob" },
  { id: "pull", label: "Pull" },
  { id: "bar", label: "Bar handle" },
];

export const FRIDGE_STYLES = [
  { id: "french", label: "French door" },
  { id: "side-by-side", label: "Side by side" },
  { id: "top-freezer", label: "Top freezer" },
  { id: "bottom-freezer", label: "Bottom freezer" },
] as const;

export const FRIDGE_HANDLES = [
  { id: "visible", label: "Visible handles" },
  { id: "hidden", label: "Hidden handles" },
] as const;

export const HANDLE_SIDES = [
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "center", label: "Center" },
] as const;

export const WINDOW_TREATMENTS = [
  { id: "none", label: "None" },
  { id: "roman-shade", label: "Roman shade" },
  { id: "cafe-curtain", label: "Café curtain" },
  { id: "blinds", label: "Blinds" },
  { id: "valence", label: "Valence" },
] as const;

/** Cabinet types drawn with hinged doors (handle orientation applies). */
export const DOOR_CABINETS: ComponentType[] = ["base-cabinet", "upper-cabinet", "tall-cabinet"];

export function isDoorCabinet(type: ComponentType) {
  return DOOR_CABINETS.includes(type);
}

/** A door cabinet wider than 24 in is drawn as a pair of doors. */
export function doorLeaves(comp: { type: ComponentType; w: number }) {
  return isDoorCabinet(comp.type) && comp.w > 24 ? 2 : 1;
}

export function finishOf(id: FinishId) {
  return FINISHES.find((f) => f.id === id) ?? FINISHES[0];
}

let counter = 0;
export function newId(prefix = "c") {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

export function createComponent(
  type: ComponentType,
  overrides: Partial<KComponent> = {},
): KComponent {
  const entry = CATALOG[type];
  return {
    id: newId(),
    type,
    x: 0,
    y: entry.defaultY,
    w: entry.w,
    h: entry.h,
    depth: entry.depth,
    finish: entry.finish,
    doorStyle: entry.doorStyle,
    hardware: entry.hardware,
    ...(isDoorCabinet(type) ? { handleSide: "center" as const } : {}),
    ...(type === "sink" ? { faucetHoles: 1 as const } : {}),
    ...(type === "refrigerator"
      ? { fridgeStyle: "french" as const, fridgeHandles: "visible" as const }
      : {}),
    ...(type === "base-cabinet" ? { topDrawer: true } : {}),
    ...(type === "window" ? { windowTreatment: "none" as const } : {}),
    groupId: null,
    ...overrides,
  };
}

