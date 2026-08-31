import { useMemo, useState } from "react";
import { useKitchen } from "@/lib/kitchen/store";
import { buyingGuide, costEstimate, materialsList } from "@/lib/kitchen/estimate";
import { money } from "@/lib/kitchen/format";

const TABS = [
  { id: "materials", label: "Materials" },
  { id: "costs", label: "Costs" },
  { id: "guide", label: "Buying guide" },
];

export function InsightsDialog({
  open,
  tab,
  onTab,
  onClose,
}: {
  open: boolean;
  tab: string;
  onTab: (t: string) => void;
  onClose: () => void;
}) {
  const { design } = useKitchen();
  const materials = useMemo(() => materialsList(design), [design]);
  const cost = useMemo(() => costEstimate(design), [design]);
  const guide = useMemo(() => buyingGuide(design), [design]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 p-6">
      <div className="flex max-h-[85vh] w-full max-w-[820px] flex-col border border-line bg-paper shadow-panel">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-[24px] leading-none text-ink">Design insights</h2>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              {design.name}
            </p>
          </div>
          <button onClick={onClose} className="text-xs text-ink-soft hover:text-ink">
            Close
          </button>
        </header>

        <nav className="flex gap-1 border-b border-line px-6 py-2 text-[12px]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              data-active={tab === t.id ? "" : undefined}
              className="border border-transparent px-2.5 py-1.5 text-ink-soft transition-colors hover:border-line data-[active]:border-line data-[active]:bg-shell data-[active]:text-ink"
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="overflow-y-auto px-6 py-5 text-[12px] text-ink">
          {!design.components.length && (
            <p className="text-ink-soft">
              Add components to the wall and this sheet will fill itself in.
            </p>
          )}

          {tab === "materials" && design.components.length > 0 && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line text-left text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Notes</th>
                  <th className="py-2 text-right">Materials</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((l) => (
                  <tr key={l.key} className="border-b border-line/60 align-top">
                    <td className="py-2 pr-3">{l.label}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{l.quantity}</td>
                    <td className="py-2 pr-3 text-ink-soft">{l.detail}</td>
                    <td className="py-2 text-right">{money(l.cost)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 font-medium" colSpan={3}>
                    Material subtotal
                  </td>
                  <td className="py-2 text-right font-medium">{money(cost.materialTotal)}</td>
                </tr>
              </tbody>
            </table>
          )}

          {tab === "costs" && design.components.length > 0 && (
            <div className="space-y-6">
              <div className="border border-line bg-shell px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                  Estimated project range
                </p>
                <p className="mt-2 font-display text-[32px] leading-none text-ink">
                  {money(cost.totalLow)} – {money(cost.totalHigh)}
                </p>
                <p className="mt-2 text-[11px] text-ink-soft">
                  Materials {money(cost.materialTotal)} · Install {money(cost.laborLow)}–
                  {money(cost.laborHigh)}
                </p>
              </div>
              <dl className="divide-y divide-line border-y border-line">
                {cost.drivers.map((d) => (
                  <div key={d.label} className="flex justify-between py-2">
                    <dt className="text-ink-soft">{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[11px] text-ink-soft">
                Ranges are planning estimates for a single-wall layout in a mid-cost US market.
              </p>
            </div>
          )}

          {tab === "guide" && design.components.length > 0 && (
            <div className="space-y-6">
              {guide.map((s) => (
                <section key={s.title}>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                    {s.title}
                  </h3>
                  <ul className="mt-2 divide-y divide-line border-y border-line">
                    {s.items.map((i) => (
                      <li key={i.name} className="py-2">
                        <div className="flex justify-between gap-4">
                          <span>{i.name}</span>
                          <span className="whitespace-nowrap text-ink-soft">{i.range}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-ink-soft">{i.guidance}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
