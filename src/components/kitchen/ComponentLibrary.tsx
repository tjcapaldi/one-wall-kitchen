import { useMeasure, type Tool } from "@/lib/kitchen/measure";
import { useState } from "react";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { CATALOG, CATEGORIES } from "@/lib/kitchen/catalog";
import { useKitchen } from "@/lib/kitchen/store";
import { inchLabel } from "@/lib/kitchen/format";
import type { CategoryId, ComponentType } from "@/lib/kitchen/types";
import { ComponentArt } from "./ComponentArt";
import { createComponent } from "@/lib/kitchen/catalog";

export function ComponentLibrary() {
  const { addComponent } = useKitchen();
  const [open, setOpen] = useState<CategoryId[]>(["cabinets", "countertops", "appliances"]);

  const toggle = (id: CategoryId) =>
    setOpen((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const allOpen = open.length === CATEGORIES.length;

  return (
    <div className="flex h-full flex-col">
      <ToolBar />
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">Components</h2>
        <span className="flex items-center gap-1">
          <button
            onClick={() => setOpen(CATEGORIES.map((c) => c.id))}
            disabled={allOpen}
            aria-label="Expand all categories"
            title="Expand all"
            className="flex h-6 w-6 items-center justify-center border border-transparent text-ink-soft transition-colors hover:border-line hover:text-ink disabled:opacity-30 disabled:hover:border-transparent"
          >
            <ChevronsDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setOpen([])}
            disabled={open.length === 0}
            aria-label="Collapse all categories"
            title="Collapse all"
            className="flex h-6 w-6 items-center justify-center border border-transparent text-ink-soft transition-colors hover:border-line hover:text-ink disabled:opacity-30 disabled:hover:border-transparent"
          >
            <ChevronsUp className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-8">
        {CATEGORIES.map((cat) => {
          const items = Object.values(CATALOG).filter((c) => c.category === cat.id);
          const isOpen = open.includes(cat.id);
          return (
            <section key={cat.id} className="mb-1">
              <button
                onClick={() => toggle(cat.id)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] tracking-wide text-ink transition-colors hover:text-ink-soft"
              >
                <span>{cat.label}</span>
                <span className="text-ink-soft">{isOpen ? "–" : "+"}</span>
              </button>
              {isOpen && (
                <ul className="grid grid-cols-2 gap-1 px-2 pb-3">
                  {items.map((item) => (
                    <li key={item.type}>
                      <button
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/x-owk-component", item.type);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => addComponent(item.type as ComponentType)}
                        className="group flex w-full flex-col items-stretch gap-1 border border-transparent p-2 text-left transition-colors hover:border-line hover:bg-paper"
                        title={`${item.label} — ${inchLabel(item.w)} × ${inchLabel(item.h)} in`}
                      >
                        <span className="flex h-14 items-end justify-center overflow-hidden">
                          <Thumb type={item.type} />
                        </span>
                        <span className="text-[11px] leading-tight text-ink">{item.label}</span>
                        <span className="text-[10px] text-ink-soft">
                          {inchLabel(item.w)}″ × {inchLabel(item.h)}″
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      <p className="border-t border-line px-5 py-3 text-[10px] leading-relaxed text-ink-soft">
        Drag onto the wall, or click to place at the next open position.
      </p>
    </div>
  );
}

function Thumb({ type }: { type: ComponentType }) {
  const comp = createComponent(type);
  const pad = 2;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${comp.w + pad * 2} ${comp.h + pad * 2}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMax meet"
    >
      <ComponentArt comp={comp} />
    </svg>
  );
}

function ToolBar() {
  const { tool, setTool } = useMeasure();
  const btn = (id: Tool, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTool(id)}
      aria-label={label}
      aria-pressed={tool === id}
      title={label}
      data-active={tool === id ? "" : undefined}
      className="flex h-8 w-8 items-center justify-center border border-transparent text-ink-soft transition-colors hover:border-line hover:text-ink data-[active]:border-ink data-[active]:bg-paper data-[active]:text-ink"
    >
      {icon}
    </button>
  );
  return (
    <div className="flex items-center gap-1 border-b border-line px-4 py-2" role="toolbar" aria-label="Tools">
      {btn(
        "pointer",
        "Select (V)",
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
          <path d="M3.5 2.5l9 5.2-4 1.1 2.4 4.2-1.6.9-2.4-4.2-3.1 2.8z" />
        </svg>,
      )}
      {btn(
        "measure",
        "Tape measure (M)",
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="1.5" y="2.5" width="11" height="11" rx="2.5" />
          <circle cx="7" cy="8" r="2.3" />
          <path d="M12.5 10.5h4v3h-4M14.5 10.5v1.2" />
        </svg>,
      )}
    </div>
  );
}
