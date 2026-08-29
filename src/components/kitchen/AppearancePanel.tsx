import { saveAppearance } from "@/lib/kitchen/storage";
import { useKitchen } from "@/lib/kitchen/store";
import { MiniButton, Section } from "./PropertiesPanel";

export const BACKGROUNDS = [
  { id: "gray", label: "Studio gray" },
  { id: "stone", label: "Stone" },
  { id: "sand", label: "Sand" },
  { id: "clay", label: "Clay" },
  { id: "sage", label: "Sage" },
  { id: "olive", label: "Olive" },
  { id: "slate", label: "Slate" },
];

export function AppearancePanel({
  open,
  onClose,
  background,
  onBackground,
}: {
  open: boolean;
  onClose: () => void;
  background: string;
  onBackground: (id: string) => void;
}) {
  const { design, setSettings } = useKitchen();
  if (!open) return null;

  return (
    <aside className="absolute right-0 top-0 z-40 h-full w-[300px] border-l border-line bg-shell shadow-drawing">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">Appearance</h2>
        <button onClick={onClose} className="text-xs text-ink-soft hover:text-ink">
          Close
        </button>
      </div>
      <div className="space-y-6 px-5 py-5">
        <Section label="Workspace background">
          <div className="grid grid-cols-2 gap-1">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onBackground(b.id);
                  saveAppearance(b.id);
                }}
                data-active={background === b.id ? "" : undefined}
                className="flex items-center gap-2 border border-line px-2 py-1.5 text-left text-[11px] text-ink transition-colors hover:bg-paper data-[active]:border-ink"
              >
                <span
                  className="h-4 w-4 border border-line"
                  style={{ backgroundColor: `var(--studio-${b.id})` }}
                />
                {b.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
            The drawing itself stays black and white — only the surround changes.
          </p>
        </Section>

        <Section label="Grid">
          <div className="grid grid-cols-3 gap-1">
            {[1, 3, 6].map((g) => (
              <MiniButton
                key={g}
                active={design.settings.gridSize === g}
                onClick={() => setSettings({ gridSize: g })}
              >
                {g} in
              </MiniButton>
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
}
