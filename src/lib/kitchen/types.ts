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

/** All measurements are real-world inches. Origin = bottom-left of the wall. */
export interface KComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  finish: FinishId;
  doorStyle?: DoorStyleId;
  hardware?: HardwareId;
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

export interface Design {
  version: 1;
  id: string;
  name: string;
  wall: { width: number; height: number };
  components: KComponent[];
  groups: KGroup[];
  settings: DesignSettings;
  palette?: Palette | null;
  createdAt: string;
  updatedAt: string;
}
