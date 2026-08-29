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

      <nav className="flex items-center gap-1 text-[12px]">
        <BarButton onClick={onNewDesign}>New</BarButton>
        <BarButton onClick={() => onOpenInsights("materials")}>Materials</BarButton>
        <BarButton onClick={() => onOpenInsights("costs")}>Costs</BarButton>
        <BarButton onClick={onOpenAi}>Assistant</BarButton>
        <span className="mx-1 h-4 w-px bg-line" />
        <BarButton onClick={save}>Save</BarButton>
        <BarButton onClick={() => fileRef.current?.click()}>Import</BarButton>
        <div className="relative">
          <BarButton onClick={() => setExportOpen((v) => !v)} active={exportOpen}>
            {exporting ? `Exporting ${exporting.toUpperCase()}…` : "Export"}
          </BarButton>
          {exportOpen && (
            <div className="absolute right-0 z-30 mt-1 w-56 border border-line bg-paper py-1 shadow-panel">
              {[
                { id: "png", title: "PNG", note: "Showcase image" },
                { id: "pdf", title: "PDF", note: "Printable design sheet" },
                { id: "json", title: "JSON", note: "Editable design file" },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => handleExport(o.id as "png")}
                  className="block w-full px-3 py-2 text-left transition-colors hover:bg-shell"
                >
                  <span className="block text-[12px] text-ink">{o.title}</span>
                  <span className="block text-[10px] text-ink-soft">{o.note}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <BarButton onClick={onOpenAppearance}>Appearance</BarButton>
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
