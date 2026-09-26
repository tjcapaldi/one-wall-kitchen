export type CategoryId =
  | "cabinets"
  | "countertops"
  | "appliances"
  | "openings"
  | "decor";

export type ComponentType =
  | "base-cabinet"
  | "upper-cabinet"
  | "tall-cabinet"
  | "drawer-cabinet"
  | "open-shelving"
  | "countertop"
  | "refrigerator"
  | "range"
  | "dishwasher"
  | "microwave"
  | "range-hood"
  | "oven"
  | "window"
  | "door"
  | "sink"
  | "pendant"
  | "plant"
  | "decor-object"
  | "stool";

export type FinishId =
  | "white"
  | "off-white"
  | "graphite"
  | "black"
  | "light-oak"
  | "walnut"
  | "clay"
  | "concrete"
  | "marble"
  | "stainless";

export type DoorStyleId = "slab" | "shaker" | "panel" | "glass";
export type HardwareId = "none" | "knob" | "pull" | "bar";
export type HandleSideId = "left" | "right" | "center";
export type FaucetHoles = 1 | 2 | 3;
export type FridgeStyleId = "french" | "side-by-side" | "top-freezer" | "bottom-freezer";
export type FridgeHandlesId = "visible" | "hidden";
export type WindowTreatmentId = "none" | "roman-shade" | "cafe-curtain" | "blinds" | "valence";

/** All measurements are real-world inches. Origin = bottom-left of the wall. */
export interface KComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  doorStyle?: DoorStyleId;
  hardware?: HardwareId;
  handleSide?: HandleSideId;
  faucetHoles?: FaucetHoles;
  fridgeStyle?: FridgeStyleId;
  fridgeHandles?: FridgeHandlesId;
  /** base cabinet: a shallow drawer above the doors */
  topDrawer?: boolean;
  windowTreatment?: WindowTreatmentId;
  groupId?: string | null;
}

export interface KGroup {
  id: string;
  name: string;
}

export interface DesignSettings {
  grid: boolean;
  snap: boolean;
  gridSize: number;
  background: string;
}

export interface Palette {
  name: string;
  description: string;
  finishes: { role: string; finish: FinishId; note: string }[];
}

/** Visualize-only configuration. Never affects the grayscale 2D drawing. */
export interface Visualization {
  styleId: string;
  paletteId: string | null;
  /** for the Custom style: chosen swatch ids from the curated library */
  customSwatches: string[];
  windowView: string | null;
}

export interface Design {
  version: 1;
  id: string;
  name: string;
  wall: { width: number; height: number };
  components: KComponent[];
  groups: KGroup[];
  settings: DesignSettings;
  palette?: Palette | null;
  visualization?: Visualization | null;
  createdAt: string;
  updatedAt: string;
}

