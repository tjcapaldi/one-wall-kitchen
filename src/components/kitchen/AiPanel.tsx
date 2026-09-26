import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CUSTOM_ROLES,
  CUSTOM_STYLE_ID,
  STYLE_DIRECTIONS,
  customStyle,
  palettesFor,
} from "@/lib/kitchen/ai";
import { CATALOG, FINISHES } from "@/lib/kitchen/catalog";
import { useKitchen } from "@/lib/kitchen/store";
import type { FinishId, Palette } from "@/lib/kitchen/types";
import { MiniButton, Section } from "./PropertiesPanel";
import { ConceptualView } from "./ConceptualView";



export function AiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { design, setPalette } = useKitchen();
  const [styleId, setStyleId] = useState<string>(STYLE_DIRECTIONS[0].id);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [custom, setCustom] = useState<Record<string, FinishId>>(() =>
    Object.fromEntries(CUSTOM_ROLES.map((r) => [r, "off-white" as FinishId])),
  );
  const [view, setView] = useState<"idle" | "loading" | "ready">("idle");

  const isCustom = styleId === CUSTOM_STYLE_ID;
  const style = useMemo(
    () => (isCustom ? customStyle(custom) : STYLE_DIRECTIONS.find((s) => s.id === styleId)!),
    [isCustom, custom, styleId],
  );
  const palettes = useMemo(
    () => (isCustom ? [style.palette] : palettesFor(style)),
    [isCustom, style],
  );
  const palette = palettes[Math.min(paletteIdx, palettes.length - 1)];

  if (!open) return null;

  const generate = () => {
    if (!design.components.length) {
      toast.error("Add a few components first — there's nothing to visualise yet.");
      return;
    }
    setView("loading");
    setTimeout(() => setView("ready"), 700);
  };

  const apply = () => {
    setPalette(palette);
    toast.success(`${palette.name} saved as this design's finish plan`, {
      description: "The drawing stays grayscale — finishes show in the conceptual view.",
    });
  };


  return (
    <aside className="absolute right-0 top-0 z-40 flex h-full w-[380px] flex-col border-l border-line bg-shell shadow-drawing">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">Visualize</h2>
          <p className="mt-1 text-[10px] text-ink-soft">
            Step 1 style · Step 2 palette · Step 3 view
          </p>
        </div>
        <button onClick={onClose} className="text-xs text-ink-soft hover:text-ink">
          Close
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <Section label="1 · Style direction">
          <div className="flex flex-wrap gap-1">
            {STYLE_DIRECTIONS.map((s) => (
              <MiniButton
                key={s.id}
                active={s.id === styleId}
                onClick={() => {
                  setStyleId(s.id);
                  setPaletteIdx(0);
                }}
              >
                {s.name}
              </MiniButton>
            ))}
            <MiniButton
              active={isCustom}
              onClick={() => {
                setStyleId(CUSTOM_STYLE_ID);
                setPaletteIdx(0);
              }}
            >
              Custom
            </MiniButton>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink">{style.summary}</p>
        </Section>

        <Section label="2 · Palette">
          {!isCustom && (
            <>
              <div className="flex flex-wrap gap-1">
                {palettes.map((p, i) => (
                  <MiniButton key={p.name} active={i === paletteIdx} onClick={() => setPaletteIdx(i)}>
                    {i === 0 ? "Signature" : p.name.split("·").pop()?.trim()}
                  </MiniButton>
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">{palette.description}</p>
            </>
          )}

          <ul className="mt-2 divide-y divide-line border border-line bg-paper">
            {palette.finishes.map((f) => (
              <li key={f.role} className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <span
                    className="h-5 w-5 shrink-0 border border-line"
                    ref={(el) => {
                      if (el) el.style.backgroundColor = swatch(f.finish);
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] text-ink">{f.role}</span>
                    <span className="block text-[10px] text-ink-soft">{f.note}</span>
                  </span>
                </div>
                {isCustom && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {FINISHES.map((fin) => (
                      <button
                        key={fin.id}
                        onClick={() => setCustom((c) => ({ ...c, [f.role]: fin.id }))}
                        title={fin.label}
                        aria-label={`${f.role}: ${fin.label}`}
                        data-active={custom[f.role] === fin.id ? "" : undefined}
                        className="h-4 w-4 border border-line data-[active]:outline data-[active]:outline-1 data-[active]:outline-offset-1 data-[active]:outline-ink"
                        ref={(el) => {
                          if (el) el.style.backgroundColor = swatch(fin.id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-2 grid grid-cols-1 gap-1">
            <MiniButton onClick={apply}>Apply this palette</MiniButton>
          </div>
        </Section>

        <Section label="Materials this style implies">
          <ul className="space-y-1.5">
            {style.materials.map((m) => (
              <li key={m} className="text-[11px] leading-relaxed text-ink-soft">
                — {m}
              </li>
            ))}
          </ul>
        </Section>

        <Section label="3 · Conceptual 3D view">
          <MiniButton onClick={generate}>
            {view === "loading" ? "Building view…" : "Create 3D view"}
          </MiniButton>
          <div className="mt-3 border border-line bg-paper p-2">
            {view === "idle" && (
              <p className="px-2 py-6 text-center text-[10px] leading-relaxed text-ink-soft">
                A quick axonometric study built from your drawing — depths, heights and finishes as
                you've set them.
              </p>
            )}
            {view === "loading" && (
              <div className="flex h-32 items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                  Projecting…
                </span>
              </div>
            )}
            {view === "ready" && <ConceptualView design={design} />}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
            Conceptual study only. The 2D drawing remains the authoritative design.
          </p>
        </Section>

        <Section label="Photoreal renders">
          <div className="border border-dashed border-line bg-paper px-3 py-4">
            <p className="text-[11px] leading-relaxed text-ink">
              Photoreal AI renders are still in the workshop — the sawdust hasn't settled.
            </p>
            <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
              Meanwhile, the conceptual view above is generated from your real dimensions, so it's
              honest about what actually fits.
            </p>
          </div>
        </Section>
      </div>
    </aside>
  );
}

function swatch(id: FinishId) {
  const map: Record<string, string> = {
    white: "#ffffff",
    "off-white": "#f4f2ed",
    concrete: "#d9d7d2",
    marble: "#eceae4",
    "light-oak": "#e3d7c4",
    walnut: "#b49a7f",
    clay: "#cdb3a2",
    stainless: "#c9cbcc",
    graphite: "#6f7170",
    black: "#1f1f1e",
  };
  return map[id] ?? "#ffffff";
}
