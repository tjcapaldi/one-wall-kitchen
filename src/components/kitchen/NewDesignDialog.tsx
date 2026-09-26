import { TEMPLATES, createDesign, randomKitchenName } from "@/lib/kitchen/templates";
import { MiniButton } from "./PropertiesPanel";
import type { Design } from "@/lib/kitchen/types";

export const DEFAULT_WALL = { width: 120, height: 96 };
export const WALL_LIMITS = { minW: 48, maxW: 480, minH: 72, maxH: 180 };

export function blankDesign(): Design {
  return createDesign(randomKitchenName(), DEFAULT_WALL, "blank");
}

/** "Choose a kitchen template" modal. Wall size is edited on the canvas. */
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
  if (!open) return null;
  const templates = TEMPLATES.filter((t) => t.id !== "blank");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-4 py-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto border border-line bg-paper shadow-drawing">
        <div className="flex items-start justify-between border-b border-line px-8 py-6">
          <div>
            <h2 className="font-display text-3xl leading-none text-ink">Choose a kitchen template</h2>
            <p className="mt-2 text-xs text-ink-soft">
              Pick a starting layout. Resize the wall afterwards by dragging its dimension lines.
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-xs text-ink-soft hover:text-ink">
              Close
            </button>
          )}
        </div>

        <div className="space-y-5 px-8 py-7">
          {savedMeta && onResume && (
            <div className="flex items-center justify-between border border-line bg-shell px-4 py-3">
              <p className="text-xs text-ink">
                Saved design “{savedMeta.name}”
                <span className="text-ink-soft"> · {new Date(savedMeta.updatedAt).toLocaleString()}</span>
              </p>
              <MiniButton onClick={onResume}>Continue editing</MiniButton>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => onCreate(createDesign(randomKitchenName(), DEFAULT_WALL, t.id))}
                className="border border-line px-3 py-3 text-left transition-colors hover:border-ink hover:bg-shell"
              >
                <span className="block font-display text-lg leading-tight text-ink">{t.name}</span>
                <span className="mt-1 block text-[10px] leading-relaxed text-ink-soft">{t.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-line px-8 py-5 text-center">
          <button
            onClick={() => onCreate(blankDesign())}
            className="text-[12px] text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Or start from scratch
          </button>
        </div>
      </div>
    </div>
  );
}
