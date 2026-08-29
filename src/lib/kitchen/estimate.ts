import { CATALOG, finishOf } from "./catalog";
import type { ComponentType, Design } from "./types";

export interface MaterialLine {
  key: string;
  label: string;
  quantity: string;
  detail: string;
  cost: number;
}

const LINEAR_FEET_TYPES: ComponentType[] = [
  "base-cabinet",
  "drawer-cabinet",
  "upper-cabinet",
  "tall-cabinet",
  "open-shelving",
  "countertop",
];

export function materialsList(design: Design): MaterialLine[] {
  const groups = new Map<ComponentType, { count: number; inches: number }>();
  for (const comp of design.components) {
    const g = groups.get(comp.type) ?? { count: 0, inches: 0 };
    g.count += 1;
    g.inches += comp.w;
    groups.set(comp.type, g);
  }

  const lines: MaterialLine[] = [];
  for (const [type, g] of groups) {
    const entry = CATALOG[type];
    if (entry.category === "openings") {
      lines.push({
        key: type,
        label: entry.label,
        quantity: `${g.count}`,
        detail: "Existing opening — no material cost",
        cost: 0,
      });
      continue;
    }
    const feet = g.inches / 12;
    const cost = entry.perFoot ? entry.price * feet : entry.price * g.count;
    lines.push({
      key: type,
      label: entry.label,
      quantity: entry.perFoot ? `${feet.toFixed(1)} lin ft` : `${g.count}`,
      detail: entry.perFoot
        ? `${g.count} unit${g.count > 1 ? "s" : ""} · approx. $${entry.price}/lin ft`
        : `approx. $${entry.price} each`,
      cost,
    });
  }

  // Hardware
  const hardwareCount = design.components.filter(
    (c) => c.hardware && c.hardware !== "none" && CATALOG[c.type].category === "cabinets",
  ).length;
  if (hardwareCount) {
    lines.push({
      key: "hardware",
      label: "Cabinet hardware",
      quantity: `${hardwareCount * 2} pieces`,
      detail: "approx. $14 each",
      cost: hardwareCount * 2 * 14,
    });
  }

  // Backsplash: wall area between counter height and uppers along counter runs
  const counterRun = design.components
    .filter((c) => c.type === "countertop")
    .reduce((s, c) => s + c.w, 0);
  if (counterRun > 0) {
    const sqft = (counterRun * 18) / 144;
    lines.push({
      key: "backsplash",
      label: "Backsplash",
      quantity: `${sqft.toFixed(1)} sq ft`,
      detail: "18 in field · approx. $22/sq ft",
      cost: sqft * 22,
    });
  }

  return lines.sort((a, b) => b.cost - a.cost);
}

export interface CostEstimate {
  materials: MaterialLine[];
  materialTotal: number;
  laborHours: number;
  laborLow: number;
  laborHigh: number;
  totalLow: number;
  totalHigh: number;
  drivers: { label: string; value: string }[];
}

export function costEstimate(design: Design): CostEstimate {
  const materials = materialsList(design);
  const materialTotal = materials.reduce((s, l) => s + l.cost, 0);

  let laborHours = 0;
  for (const comp of design.components) {
    const entry = CATALOG[comp.type];
    laborHours += entry.perFoot ? entry.laborHours * (comp.w / 24) : entry.laborHours;
  }
  laborHours = Math.max(laborHours, design.components.length ? 4 : 0);
  const laborLow = laborHours * 75;
  const laborHigh = laborHours * 125;

  const applianceCount = design.components.filter(
    (c) => CATALOG[c.type].category === "appliances",
  ).length;
  const cabinetFeet =
    design.components
      .filter((c) => CATALOG[c.type].category === "cabinets")
      .reduce((s, c) => s + c.w, 0) / 12;

  return {
    materials,
    materialTotal,
    laborHours,
    laborLow,
    laborHigh,
    totalLow: materialTotal + laborLow,
    totalHigh: materialTotal + laborHigh,
    drivers: [
      { label: "Wall length", value: `${(design.wall.width / 12).toFixed(1)} ft` },
      { label: "Cabinetry", value: `${cabinetFeet.toFixed(1)} lin ft` },
      { label: "Appliances", value: `${applianceCount}` },
      { label: "Estimated install", value: `${laborHours.toFixed(1)} hrs @ $75–125/hr` },
      { label: "Components", value: `${design.components.length}` },
    ],
  };
}

export interface GuideSection {
  title: string;
  items: { name: string; guidance: string; range: string }[];
}

export function buyingGuide(design: Design): GuideSection[] {
  const has = (t: ComponentType) => design.components.some((c) => c.type === t);
  const finishes = Array.from(new Set(design.components.map((c) => finishOf(c.finish).label)));
  const sections: GuideSection[] = [];

  const cabinetItems = (["base-cabinet", "drawer-cabinet", "upper-cabinet", "tall-cabinet", "open-shelving"] as ComponentType[])
    .filter(has)
    .map((t) => ({
      name: CATALOG[t].label,
      guidance:
        t === "open-shelving"
          ? "Solid wood shelf with concealed brackets, 1.5 in minimum thickness."
          : "Ready-to-assemble frameless boxes with plywood sides and soft-close hinges.",
      range: `$${CATALOG[t].price - 40}–$${CATALOG[t].price + 90} per linear ft`,
    }));
  if (cabinetItems.length) sections.push({ title: "Cabinets", items: cabinetItems });

  if (has("countertop")) {
    sections.push({
      title: "Countertops",
      items: [
        {
          name: "Engineered quartz",
          guidance: "Most forgiving for a working wall — uniform, non-porous, no sealing.",
          range: "$60–$100 per sq ft installed",
        },
        {
          name: "Honed stone or concrete look",
          guidance: "Matches the restrained palette in this design; expect visible patina.",
          range: "$70–$120 per sq ft installed",
        },
      ],
    });
  }

  const appliances = (["refrigerator", "range", "oven", "dishwasher", "microwave", "range-hood"] as ComponentType[])
    .filter(has)
    .map((t) => ({
      name: CATALOG[t].label,
      guidance:
        t === "range-hood"
          ? "Size to the range width or wider; 400+ CFM for gas."
          : `Confirm the ${CATALOG[t].label.toLowerCase()} rough opening matches the drawing before ordering.`,
      range: `$${Math.round(CATALOG[t].price * 0.6)}–$${Math.round(CATALOG[t].price * 1.8)}`,
    }));
  if (appliances.length) sections.push({ title: "Appliances", items: appliances });

  const hardwareUsed = Array.from(
    new Set(design.components.map((c) => c.hardware).filter((h) => h && h !== "none")),
  );
  if (hardwareUsed.length) {
    sections.push({
      title: "Hardware",
      items: hardwareUsed.map((h) => ({
        name: h === "knob" ? "Cabinet knobs" : h === "pull" ? "Edge pulls" : "Bar handles",
        guidance: "Solid brass or stainless, matte finish. Buy 10% extra for spares.",
        range: "$8–$28 per piece",
      })),
    });
  }

  if (has("sink") || has("pendant")) {
    sections.push({
      title: "Fixtures",
      items: [
        ...(has("sink")
          ? [
              {
                name: "Undermount sink + faucet",
                guidance: "16-gauge stainless, single bowl 27 in or wider for a one-wall layout.",
                range: "$350–$900",
              },
            ]
          : []),
        ...(has("pendant")
          ? [
              {
                name: "Pendant lighting",
                guidance: "Hang 30–36 in above the counter; dimmable warm 2700K lamps.",
                range: "$120–$400 each",
              },
            ]
          : []),
      ],
    });
  }

  sections.push({
    title: "Miscellaneous materials",
    items: [
      { name: "Backsplash tile & setting materials", guidance: "Order 15% overage for cuts.", range: "$18–$30 per sq ft" },
      { name: "Filler strips, scribe & toe kick", guidance: `Match your ${finishes.slice(0, 2).join(" / ") || "cabinet"} finish.`, range: "$60–$180" },
      { name: "Sealant, shims, fasteners", guidance: "Basic install consumables.", range: "$80–$150" },
    ],
  });

  return sections;
}
