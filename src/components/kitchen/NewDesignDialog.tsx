import { useState } from "react";
import { TEMPLATES, createDesign } from "@/lib/kitchen/templates";
import { toFeetInches } from "@/lib/kitchen/format";
import { MiniButton, Section } from "./PropertiesPanel";
import type { Design } from "@/lib/kitchen/types";

const HEIGHTS = [
  { label: "6.5 ft", value: 78 },
  { label: "8 ft", value: 96 },
  { label: "9 ft", value: 108 },
];

const WIDTHS = [
  { label: "Small", note: "7 ft", value: 84 },
  { label: "Medium", note: "10 ft", value: 120 },
  { label: "Large", note: "14 ft", value: 168 },
];

export function NewDesignDialog({
  open,
  savedMeta,
  onCreate,
  onResume,
  onClose,
}: {
  open: boolean;
  savedMeta: { name: string; updatedAt: string } | null;
  onCreate: (design: Design) => void;
  onResume?: () => void;
  onClose?: () => void;
}) {
  const [template, setTemplate] = useState("standard");
  const [height, setHeight] = useState(96);
  const [width, setWidth] = useState(120);
  const [custom, setCustom] = useState(false);
  const [name, setName] = useState("Untitled kitchen");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-4 py-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto border border-line bg-paper shadow-drawing">
        <div className="flex items-start justify-between border-b border-line px-8 py-6">
          <div>
            <h2 className="font-display text-3xl leading-none text-ink">New design</h2>
            <p className="mt-2 text-xs text-ink-soft">
              Choose a wall and a starting point. Everything stays editable.
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-xs text-ink-soft hover:text-ink">
              Close
            </button>
          )}
        </div>

        <div className="space-y-7 px-8 py-7">
          {savedMeta && onResume && (
            <div className="flex items-center justify-between border border-line bg-shell px-4 py-3">
              <p className="text-xs text-ink">
                Saved design “{savedMeta.name}”
                <span className="text-ink-soft">
                  {" "}
                  · {new Date(savedMeta.updatedAt).toLocaleString()}
                </span>
              </p>
              <MiniButton onClick={onResume}>Continue editing</MiniButton>
            </div>
          )}

          <Section label="Design name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line bg-paper px-3 py-2 text-[13px] text-ink outline-none focus:border-ink"
            />
          </Section>

          <Section label="Wall height">
            <div className="flex flex-wrap gap-1">
              {HEIGHTS.map((h) => (
                <MiniButton key={h.value} active={height === h.value && !custom} onClick={() => { setHeight(h.value); setCustom(false); }}>
                  {h.label}
                </MiniButton>
              ))}
            </div>
          </Section>

          <Section label="Wall width">
            <div className="flex flex-wrap gap-1">
              {WIDTHS.map((w) => (
                <MiniButton key={w.value} active={width === w.value && !custom} onClick={() => { setWidth(w.value); setCustom(false); }}>
                  {w.label} — {w.note}
                </MiniButton>
              ))}
              <MiniButton active={custom} onClick={() => setCustom(true)}>
                Custom
              </MiniButton>
            </div>
            {custom && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[10px] text-ink-soft">Width (in)</span>
                  <input
                    type="number"
                    min={48}
                    max={480}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value) || 120)}
                    className="w-full border border-line bg-paper px-2 py-1.5 text-[12px] tabular-nums text-ink outline-none focus:border-ink"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] text-ink-soft">Height (in)</span>
                  <input
                    type="number"
                    min={72}
                    max={180}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value) || 96)}
                    className="w-full border border-line bg-paper px-2 py-1.5 text-[12px] tabular-nums text-ink outline-none focus:border-ink"
                  />
                </label>
              </div>
            )}
            <p className="mt-2 text-[10px] text-ink-soft">
              {toFeetInches(width)} × {toFeetInches(height)}
            </p>
          </Section>

          <Section label="Starting point">
            <div className="grid gap-2 sm:grid-cols-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  data-active={template === t.id ? "" : undefined}
                  className="border border-line px-3 py-3 text-left transition-colors hover:bg-shell data-[active]:border-ink"
                >
                  <span className="block font-display text-lg leading-tight text-ink">{t.name}</span>
                  <span className="mt-1 block text-[10px] leading-relaxed text-ink-soft">
                    {t.description}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-8 py-5">
          <button
            onClick={() => {
              const clamped = {
                width: Math.min(480, Math.max(48, width)),
                height: Math.min(180, Math.max(72, height)),
              };
              onCreate(createDesign(name.trim() || "Untitled kitchen", clamped, template));
            }}
            className="border border-ink bg-ink px-5 py-2 text-[12px] text-paper transition-opacity hover:opacity-85"
          >
            Enter the editor
          </button>
        </div>
      </div>
    </div>
  );
}
