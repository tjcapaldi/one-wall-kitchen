import { useRef, useState } from "react";
import { toast } from "sonner";
import { useKitchen } from "@/lib/kitchen/store";
import { saveDesign, validateDesign } from "@/lib/kitchen/storage";
import { exportJson, exportPdf, exportPng } from "@/lib/kitchen/exporters";
import { toFeetInches } from "@/lib/kitchen/format";

export function TopBar({
  onNewDesign,
  onOpenAppearance,
  onOpenAi,
  onOpenInsights,
}: {
  onNewDesign: () => void;
  onOpenAppearance: () => void;
  onOpenAi: () => void;
  onOpenInsights: (tab: string) => void;
}) {
  const { design, rename, markSaved, dirty, replaceDesign } = useKitchen();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const save = () => {
    saveDesign(design);
    markSaved();
    toast.success("Design saved to this browser");
  };

  const handleExport = async (kind: "png" | "pdf" | "json") => {
    setExportOpen(false);
    setExporting(kind);
    try {
      if (kind === "png") await exportPng(design);
      else if (kind === "pdf") await exportPdf(design);
      else exportJson(design);
      toast.success(`${kind.toUpperCase()} exported`);
    } catch {
      toast.error("That export didn't complete. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const onImport = async (file: File) => {
    try {
      const parsed = validateDesign(JSON.parse(await file.text()));
      replaceDesign(parsed, { dirty: true });
      toast.success(`Imported “${parsed.name}”`);
    } catch (err) {
      toast.error(
        err instanceof Error && err.message && !err.message.includes("JSON")
          ? err.message
          : "That file isn't a One Wall Kitchen design.",
      );
    }
  };

  return (
    <header className="flex shrink-0 items-center gap-6 border-b border-line bg-shell px-6 py-3">
      <div className="min-w-0">
        <h1 className="font-display text-[26px] leading-none tracking-tight text-ink">
          One Wall Kitchen
        </h1>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          2D wall planner
        </p>
      </div>

      <div className="ml-4 hidden min-w-0 flex-1 items-baseline gap-3 md:flex">
        <input
          value={design.name}
          onChange={(e) => rename(e.target.value)}
          aria-label="Design name"
          className="min-w-0 max-w-[280px] flex-1 border-b border-transparent bg-transparent py-1 text-[13px] text-ink outline-none transition-colors hover:border-line focus:border-ink"
        />
        <span className="whitespace-nowrap text-[11px] text-ink-soft">
          {toFeetInches(design.wall.width)} × {toFeetInches(design.wall.height)}
          {dirty ? " · unsaved" : " · saved"}
        </span>
      </div>

      <nav className="ml-auto flex items-center gap-1 text-[12px]">
        <BarButton onClick={onNewDesign}>New</BarButton>
        <BarButton onClick={onOpenAi}>Visualize</BarButton>
        <BarButton onClick={() => onOpenInsights("materials")}>Plan</BarButton>
        <span className="mx-1 h-4 w-px bg-line" />
        <BarButton onClick={onOpenAppearance}>Appearance</BarButton>
        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            data-active={exportOpen ? "" : undefined}
            aria-label="File options"
            title="File options"
            className="flex h-[30px] w-[30px] items-center justify-center border border-transparent text-ink transition-colors hover:border-line hover:bg-paper data-[active]:border-line data-[active]:bg-paper"
          >
            <Gear />
          </button>
          {exportOpen && (
            <div className="absolute right-0 z-30 mt-1 w-60 border border-line bg-paper py-1 shadow-panel">
              <MenuItem
                title={dirty ? "Save now" : "Save now (up to date)"}
                note="Store this design in this browser"
                onClick={() => {
                  setExportOpen(false);
                  save();
                }}
              />
              <MenuItem
                title="Import JSON…"
                note="Open an existing design file"
                onClick={() => {
                  setExportOpen(false);
                  fileRef.current?.click();
                }}
              />
              <div className="my-1 h-px bg-line" />
              {[
                { id: "png", title: "Export PNG", note: "Showcase image" },
                { id: "pdf", title: "Export PDF", note: "Printable design sheet" },
                { id: "json", title: "Export JSON", note: "Editable design file" },
              ].map((o) => (
                <MenuItem
                  key={o.id}
                  title={exporting === o.id ? `Exporting ${o.id.toUpperCase()}…` : o.title}
                  note={o.note}
                  onClick={() => handleExport(o.id as "png")}
                />
              ))}
            </div>
          )}
        </div>
      </nav>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }}
      />
    </header>
  );
}

function BarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      data-active={active ? "" : undefined}
      className="border border-transparent px-2.5 py-1.5 text-ink transition-colors hover:border-line hover:bg-paper data-[active]:border-line data-[active]:bg-paper"
    >
      {children}
    </button>
  );
}
