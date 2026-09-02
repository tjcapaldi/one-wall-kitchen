import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { KitchenProvider, useKitchen } from "@/lib/kitchen/store";
import { createDesign, randomKitchenName } from "@/lib/kitchen/templates";
import { loadAppearance, loadDesign, saveAppearance, savedDesignMeta } from "@/lib/kitchen/storage";
import { CanvasStage } from "@/components/kitchen/CanvasStage";
import { ComponentLibrary } from "@/components/kitchen/ComponentLibrary";
import { PropertiesPanel } from "@/components/kitchen/PropertiesPanel";
import { TopBar } from "@/components/kitchen/TopBar";
import { NewDesignDialog } from "@/components/kitchen/NewDesignDialog";
import { AppearancePanel } from "@/components/kitchen/AppearancePanel";
import { AiPanel } from "@/components/kitchen/AiPanel";
import { InsightsDialog } from "@/components/kitchen/InsightsDialog";
import type { Design } from "@/lib/kitchen/types";

const TITLE = "One Wall Kitchen — 2D kitchen wall planner";
const DESCRIPTION =
  "Design a one-wall kitchen in 2D: drag cabinets and appliances to exact inches, snap and align them, then export material lists, cost estimates, PNG, PDF or JSON.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [initial] = useState<Design>(() => createDesign(randomKitchenName(), { width: 120, height: 96 }, "standard"));
  return (
    <KitchenProvider initial={initial}>
      <Editor />
      <Toaster position="bottom-right" />
    </KitchenProvider>
  );
}

function Editor() {
  const { design, setSettings, undo, redo, canUndo, canRedo, replaceDesign } = useKitchen();
  const [newOpen, setNewOpen] = useState(false);
  const [savedMeta, setSavedMeta] = useState<{ name: string; updatedAt: string } | null>(null);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [background, setBackground] = useState("gray");

  useEffect(() => {
    setSavedMeta(savedDesignMeta());
    const bg = loadAppearance();
    if (bg) setBackground(bg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resume = () => {
    const saved = loadDesign();
    if (saved) replaceDesign(saved);
    setNewOpen(false);
  };

  return (
    <div className="flex h-screen flex-col bg-paper text-ink">
      <TopBar
        onNewDesign={() => {
          setSavedMeta(savedDesignMeta());
          setNewOpen(true);
        }}
        onOpenAppearance={() => setAppearanceOpen(true)}
        onOpenAi={() => setAiOpen(true)}
        onOpenInsights={(tab) => setInsights(tab)}
      />

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-[260px] shrink-0 border-r border-line bg-shell lg:block">
          <ComponentLibrary />
        </aside>
        <main
          className="min-w-0 flex-1"
          style={{ backgroundColor: `var(--studio-${background}, var(--color-shell))` }}
        >
          <CanvasStage />
        </main>
        <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-line bg-shell xl:block">
          <PropertiesPanel />
        </aside>

        <AppearancePanel
          open={appearanceOpen}
          onClose={() => setAppearanceOpen(false)}
          background={background}
          onBackground={(id) => {
            setBackground(id);
            saveAppearance(id);
          }}
        />
        <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      </div>

      <footer className="flex shrink-0 items-center gap-4 border-t border-line bg-shell px-6 py-2 text-[11px] text-ink-soft">
        <StatusToggle
          on={design.settings.grid}
          onClick={() => setSettings({ grid: !design.settings.grid })}
          label="Grid"
        />
        <StatusToggle
          on={design.settings.snap}
          onClick={() => setSettings({ snap: !design.settings.snap })}
          label="Snap"
        />
        <span className="flex items-center gap-1">
          Grid size
          {[1, 3, 6].map((g) => (
            <button
              key={g}
              onClick={() => setSettings({ gridSize: g })}
              data-active={design.settings.gridSize === g ? "" : undefined}
              className="border border-transparent px-1.5 py-0.5 hover:border-line data-[active]:border-line data-[active]:bg-paper data-[active]:text-ink"
            >
              {g}″
            </button>
          ))}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="border border-transparent px-2 py-0.5 hover:border-line disabled:opacity-40"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="border border-transparent px-2 py-0.5 hover:border-line disabled:opacity-40"
          >
            Redo
          </button>
        </span>
        <span>{design.components.length} components</span>
      </footer>

      <NewDesignDialog
        open={newOpen}
        savedMeta={savedMeta}
        onCreate={(d) => {
          replaceDesign(d, { dirty: true });
          setNewOpen(false);
        }}
        onResume={savedMeta ? resume : undefined}
        onClose={() => setNewOpen(false)}
      />
      <InsightsDialog
        open={insights !== null}
        tab={insights ?? "materials"}
        onTab={setInsights}
        onClose={() => setInsights(null)}
      />
    </div>
  );
}

function StatusToggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      data-active={on ? "" : undefined}
      className="border border-transparent px-2 py-0.5 hover:border-line data-[active]:border-line data-[active]:bg-paper data-[active]:text-ink"
    >
      {label} {on ? "on" : "off"}
    </button>
  );
}
