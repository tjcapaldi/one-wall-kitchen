import { useEffect, useState } from "react";
import {
  CATALOG,
  DOOR_STYLES,
  FRIDGE_HANDLES,
  FRIDGE_STYLES,
  HANDLE_SIDES,
  HARDWARE,
  WINDOW_TREATMENTS,
  isDoorCabinet,
  doorLeaves,
} from "@/lib/kitchen/catalog";
import { useKitchen } from "@/lib/kitchen/store";
import { measureLength, useMeasure } from "@/lib/kitchen/measure";
import { measureLabel } from "./MeasureLayer";
import { inchLabel, inchWithFeet, toFeetInches } from "@/lib/kitchen/format";
import type {
  DoorStyleId,
  FaucetHoles,
  FridgeHandlesId,
  FridgeStyleId,
  HandleSideId,
  HardwareId,
  WindowTreatmentId,
} from "@/lib/kitchen/types";

export function PropertiesPanel() {
  const { selected, design, updateComponents, align, distribute, group, ungroup, duplicateSelected, removeSelected } =
    useKitchen();
  const ms = useMeasure();

  if (ms.current) {
    const m = ms.current;
    return (
      <PanelShell title="Measurement">
        <div className="space-y-6 px-5 py-5">
          <dl className="space-y-3 text-xs">
            <Row label="Length" value={measureLabel(measureLength(m))} />
            <Row label="Horizontal" value={`${inchLabel(Math.abs(m.b.x - m.a.x))} in`} />
            <Row label="Vertical" value={`${inchLabel(Math.abs(m.b.y - m.a.y))} in`} />
          </dl>
          <div className="grid grid-cols-3 gap-1">
            <MiniButton onClick={() => ms.duplicate(m.id)}>Duplicate</MiniButton>
            <MiniButton onClick={() => ms.update(m.id, { locked: !m.locked })} active={m.locked}>
              {m.locked ? "Unlock" : "Lock"}
            </MiniButton>
            <MiniButton onClick={() => ms.remove(m.id)}>Delete</MiniButton>
          </div>
          <p className="text-[11px] leading-relaxed text-ink-soft">
            {m.locked
              ? "Locked — this reading stays on the wall when you click elsewhere or take new measurements."
              : "Unlocked — clicking elsewhere or taking a new measurement clears it. Lock it to keep several on the wall."}
          </p>
        </div>
      </PanelShell>
    );
  }

  if (selected.length === 0) {
    return (
      <PanelShell title="Properties">
        <div className="px-5 py-6">
          <p className="text-xs leading-relaxed text-ink-soft">
            Nothing selected. Click a component on the wall to edit its dimensions, position and
            dimensions. Shift-click or drag on the wall to select several.
          </p>
          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-xs">
            <Row label="Wall width" value={`${inchLabel(design.wall.width)} in (${toFeetInches(design.wall.width)})`} />
            <Row label="Wall height" value={`${inchLabel(design.wall.height)} in (${toFeetInches(design.wall.height)})`} />
            <Row label="Components" value={`${design.components.length}`} />
            <Row label="Groups" value={`${design.groups.length}`} />
          </dl>
        </div>
      </PanelShell>
    );
  }

  if (selected.length > 1) {
    const grouped = selected.some((c) => c.groupId);
    return (
      <PanelShell title={`${selected.length} selected`}>
        <div className="space-y-6 px-5 py-5">
          <Section label="Align">
            <div className="grid grid-cols-3 gap-1">
              <MiniButton onClick={() => align("left")}>Left</MiniButton>
              <MiniButton onClick={() => align("hcenter")}>Center</MiniButton>
              <MiniButton onClick={() => align("right")}>Right</MiniButton>
              <MiniButton onClick={() => align("bottom")}>Bottom</MiniButton>
              <MiniButton onClick={() => align("vcenter")}>Middle</MiniButton>
              <MiniButton onClick={() => align("top")}>Top</MiniButton>
            </div>
          </Section>
          <Section label="Distribute">
            <div className="grid grid-cols-2 gap-1">
              <MiniButton onClick={() => distribute("h")} disabled={selected.length < 3}>
                Horizontally
              </MiniButton>
              <MiniButton onClick={() => distribute("v")} disabled={selected.length < 3}>
                Vertically
              </MiniButton>
            </div>
          </Section>
          <Section label="Organise">
            <div className="grid grid-cols-2 gap-1">
              <MiniButton onClick={group}>Group</MiniButton>
              <MiniButton onClick={ungroup} disabled={!grouped}>
                Ungroup
              </MiniButton>
              <MiniButton onClick={duplicateSelected}>Duplicate</MiniButton>
              <MiniButton onClick={removeSelected}>Delete</MiniButton>
            </div>
          </Section>
        </div>
      </PanelShell>
    );
  }

  const comp = selected[0];
  const entry = CATALOG[comp.type];
  const patch = (p: Parameters<typeof updateComponents>[0][number]["patch"]) =>
    updateComponents([{ id: comp.id, patch: p }]);

  return (
    <PanelShell title={entry.label}>
      <div className="space-y-6 px-5 py-5">
        <Section label="Dimensions">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Width"
              value={comp.w}
              min={entry.min.w}
              max={entry.max.w}
              disabled={!entry.resizable.w}
              onChange={(w) => patch({ w })}
            />
            <NumberField
              label="Height"
              value={comp.h}
              min={entry.min.h}
              max={entry.max.h}
              disabled={!entry.resizable.h}
              onChange={(h) => patch({ h })}
            />
            {entry.depth > 0 && (
              <NumberField label="Depth" value={comp.depth} min={4} max={36} onChange={(depth) => patch({ depth })} />
            )}
          </div>
          <p className="mt-2 text-[10px] text-ink-soft">
            {inchWithFeet(comp.w)} wide · limits {inchLabel(entry.min.w)}–{inchLabel(entry.max.w)} in
          </p>
        </Section>

        <Section label="Position">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="From left" value={comp.x} min={0} max={design.wall.width - comp.w} onChange={(x) => patch({ x })} />
            <NumberField label="From floor" value={comp.y} min={0} max={design.wall.height - comp.h} onChange={(y) => patch({ y })} />
          </div>
          <p className="mt-2 text-[10px] text-ink-soft">
            Left edge at {inchWithFeet(comp.x)} · top at {inchWithFeet(comp.y + comp.h)}
          </p>
        </Section>

        {entry.doorStyle && (
          <Section label="Door style">
            <div className="grid grid-cols-4 gap-1">
              {DOOR_STYLES.map((d) => (
                <MiniButton
                  key={d.id}
                  active={comp.doorStyle === d.id}
                  onClick={() => patch({ doorStyle: d.id as DoorStyleId })}
                >
                  {d.label}
                </MiniButton>
              ))}
            </div>
          </Section>
        )}

        {entry.hardware && (
          <Section label="Hardware">
            <div className="grid grid-cols-4 gap-1">
              {HARDWARE.map((hw) => (
                <MiniButton
                  key={hw.id}
                  active={comp.hardware === hw.id}
                  onClick={() => patch({ hardware: hw.id as HardwareId })}
                >
                  {hw.label}
                </MiniButton>
              ))}
            </div>
          </Section>
        )}

        {isDoorCabinet(comp.type) && (
          <Section label={doorLeaves(comp) === 2 ? "Handles (double doors)" : "Handle side"}>
            <div className="grid grid-cols-3 gap-1">
              {HANDLE_SIDES.map((h) => (
                <MiniButton
                  key={h.id}
                  active={(comp.handleSide ?? "center") === h.id}
                  onClick={() => patch({ handleSide: h.id as HandleSideId })}
                >
                  {h.label}
                </MiniButton>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-ink-soft">
              {doorLeaves(comp) === 2
                ? "Two leaves — “Center” places pulls on the meeting edges."
                : "A single door — pick the side the hand goes."}
            </p>
          </Section>
        )}

        {comp.type === "base-cabinet" && (
          <Section label="Top drawer">
            <div className="grid grid-cols-2 gap-1">
              <MiniButton
                active={comp.topDrawer !== false}
                onClick={() => patch({ topDrawer: true })}
              >
                With drawer
              </MiniButton>
              <MiniButton
                active={comp.topDrawer === false}
                onClick={() => patch({ topDrawer: false })}
              >
                Doors only
              </MiniButton>
            </div>
          </Section>
        )}

        {comp.type === "window" && (
          <Section label="Window treatment">
            <div className="grid grid-cols-2 gap-1">
              {WINDOW_TREATMENTS.map((t) => (
                <MiniButton
                  key={t.id}
                  active={(comp.windowTreatment ?? "none") === t.id}
                  onClick={() => patch({ windowTreatment: t.id as WindowTreatmentId })}
                >
                  {t.label}
                </MiniButton>
              ))}
            </div>
          </Section>
        )}

        {comp.type === "sink" && (
          <Section label="Faucet holes">

            <div className="grid grid-cols-3 gap-1">
              {([1, 2, 3] as FaucetHoles[]).map((n) => (
                <MiniButton
                  key={n}
                  active={(comp.faucetHoles ?? 1) === n}
                  onClick={() => patch({ faucetHoles: n })}
                >
                  {n} hole{n > 1 ? "s" : ""}
                </MiniButton>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-ink-soft">
              The basin sits below the counter line, so only the deck fittings are drawn.
            </p>
          </Section>
        )}

        {comp.type === "refrigerator" && (
          <>
            <Section label="Fridge style">
              <div className="grid grid-cols-2 gap-1">
                {FRIDGE_STYLES.map((f) => (
                  <MiniButton
                    key={f.id}
                    active={(comp.fridgeStyle ?? "french") === f.id}
                    onClick={() => patch({ fridgeStyle: f.id as FridgeStyleId })}
                  >
                    {f.label}
                  </MiniButton>
                ))}
              </div>
            </Section>
            <Section label="Handles">
              <div className="grid grid-cols-2 gap-1">
                {FRIDGE_HANDLES.map((f) => (
                  <MiniButton
                    key={f.id}
                    active={(comp.fridgeHandles ?? "visible") === f.id}
                    onClick={() => patch({ fridgeHandles: f.id as FridgeHandlesId })}
                  >
                    {f.label}
                  </MiniButton>
                ))}
              </div>
            </Section>
          </>
        )}

        <Section label="Component">
          <div className="grid grid-cols-2 gap-1">
            <MiniButton onClick={duplicateSelected}>Duplicate</MiniButton>
            <MiniButton onClick={removeSelected}>Delete</MiniButton>
          </div>
          {entry.note && <p className="mt-2 text-[10px] text-ink-soft">{entry.note}</p>}
        </Section>
      </div>
    </PanelShell>
  );
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 pb-3 pt-5">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[10px] uppercase tracking-[0.16em] text-ink-soft">{label}</h3>
      {children}
    </section>
  );
}

export function MiniButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-active={active ? "" : undefined}
      className="border border-line px-2 py-1.5 text-[11px] text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-35 data-[active]:border-ink data-[active]:bg-ink data-[active]:text-paper"
    >
      {children}
    </button>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(Math.round(value * 100) / 100));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(String(Math.round(value * 100) / 100));
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const v = Number(draft);
    if (!Number.isFinite(v) || draft.trim() === "") {
      setDraft(String(Math.round(value * 100) / 100));
      return;
    }
    const clamped = Math.min(max, Math.max(min, v));
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] text-ink-soft">{label}</span>
      <span className="flex items-center border border-line bg-paper focus-within:border-ink">
        <input
          type="number"
          value={draft}
          min={min}
          max={max}
          step={0.25}
          disabled={disabled}
          onFocus={() => setEditing(true)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setDraft(String(Math.round(value * 100) / 100));
              setEditing(false);
              e.currentTarget.blur();
            }
          }}
          className="w-full bg-transparent px-2 py-1.5 text-[12px] tabular-nums text-ink outline-none disabled:opacity-40"
        />
        <span className="pr-2 text-[10px] text-ink-soft">in</span>
      </span>
    </label>
  );
}


function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  );
}
