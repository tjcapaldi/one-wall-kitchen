import { useCallback, useEffect, useRef, useState } from "react";
import { CATALOG } from "@/lib/kitchen/catalog";
import { useKitchen } from "@/lib/kitchen/store";
import { inchLabel, toFeetInches } from "@/lib/kitchen/format";
import type { ComponentType, KComponent } from "@/lib/kitchen/types";
import { ComponentArt } from "./ComponentArt";
import { WALL_LIMITS } from "./NewDesignDialog";

const MARGIN = 22; // inches of drawing margin for dimension lines
const SNAP_TOLERANCE = 2.5; // inches

type Handle = "e" | "w" | "n" | "s" | "ne" | "nw" | "se" | "sw";

interface DragState {
  mode: "move" | "resize" | "marquee";
  handle?: Handle;
  startX: number;
  startY: number;
  origin: KComponent[];
  marquee?: { x: number; y: number; w: number; h: number };
}

export function CanvasStage() {
  const {
    design,
    selection,
    selected,
    setSelection,
    toggleSelection,
    updateComponents,
    addComponent,
    beginTransaction,
    removeSelected,
    duplicateSelected,
    resizeWall,
  } = useKitchen();
  const [vp, setVp] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVp({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const [marquee, setMarquee] = useState<DragState["marquee"] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    setZoom((z) => {
      const next = Math.min(4, Math.max(0.35, z * factor));
      const k = next / z;
      setOffset((o) => ({ x: px - (px - o.x) * k, y: py - (py - o.y) * k }));
      return next;
    });
  }, []);

  const zoomBy = useCallback(
    (factor: number) => {
      const r = viewportRef.current?.getBoundingClientRect();
      zoomAt(factor, (r?.width ?? 0) / 2, (r?.height ?? 0) / 2);
    },
    [zoomAt],
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const wheelRef = useRef(zoomAt);
  wheelRef.current = zoomAt;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      wheelRef.current(Math.exp(-dy * 0.0015), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);


  const { width: wallW, height: wallH } = design.wall;
  const viewBox = `${-MARGIN} ${-MARGIN} ${wallW + MARGIN * 2} ${wallH + MARGIN * 2}`;

  const toWall = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const r = svg.getBoundingClientRect();
      const total = wallW + MARGIN * 2;
      const scale = r.width / total;
      const x = (clientX - r.left) / scale - MARGIN;
      const yTop = (clientY - r.top) / scale - MARGIN;
      return { x, y: wallH - yTop };
    },
    [wallW, wallH],
  );

  const snapValue = useCallback(
    (value: number, candidates: number[]) => {
      let best = value;
      let bestDist = SNAP_TOLERANCE;
      for (const c of candidates) {
        const d = Math.abs(c - value);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      return { value: best, snapped: best !== value };
    },
    [],
  );

  const onPointerDownComponent = (e: React.PointerEvent, comp: KComponent) => {
    e.stopPropagation();
    const isSelected = selection.includes(comp.id);
    if (e.shiftKey) toggleSelection(comp.id);
    else if (!isSelected) setSelection([comp.id]);
    const start = toWall(e.clientX, e.clientY);
    const targets = (e.shiftKey || isSelected ? selectedOrSelf(comp) : [comp]).map((c) => ({ ...c }));
    beginTransaction();
    drag.current = { mode: "move", startX: start.x, startY: start.y, origin: targets };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const selectedOrSelf = (comp: KComponent) => {
    const ids = new Set(selection);
    ids.add(comp.id);
    const groupIds = new Set(
      design.components.filter((c) => ids.has(c.id) && c.groupId).map((c) => c.groupId),
    );
    return design.components.filter((c) => ids.has(c.id) || (c.groupId && groupIds.has(c.groupId)));
  };

  const onPointerDownHandle = (e: React.PointerEvent, comp: KComponent, handle: Handle) => {
    e.stopPropagation();
    const start = toWall(e.clientX, e.clientY);
    beginTransaction();
    drag.current = { mode: "resize", handle, startX: start.x, startY: start.y, origin: [{ ...comp }] };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerDownWall = (e: React.PointerEvent, axis: "w" | "h") => {
    e.stopPropagation();
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const scale = svg.getBoundingClientRect().width / (wallW + MARGIN * 2);
    const base = design.components.map((c) => ({ ...c }));
    const start = { x: e.clientX, y: e.clientY, w: wallW, h: wallH };
    const { snap, gridSize } = design.settings;
    beginTransaction();
    const move = (ev: PointerEvent) => {
      let w = start.w;
      let h = start.h;
      if (axis === "w") w = start.w + (ev.clientX - start.x) / scale;
      else h = start.h - (ev.clientY - start.y) / scale;
      if (snap) {
        w = Math.round(w / gridSize) * gridSize;
        h = Math.round(h / gridSize) * gridSize;
      }
      w = Math.min(WALL_LIMITS.maxW, Math.max(WALL_LIMITS.minW, round(w)));
      h = Math.min(WALL_LIMITS.maxH, Math.max(WALL_LIMITS.minH, round(h)));
      resizeWall({ width: w, height: h }, base, { commit: false });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onPointerDownCanvas = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const start = toWall(e.clientX, e.clientY);
    setSelection([]);
    drag.current = { mode: "marquee", startX: start.x, startY: start.y, origin: [] };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toWall(e.clientX, e.clientY);
    const dx = p.x - d.startX;
    const dy = p.y - d.startY;

    if (d.mode === "marquee") {
      const box = {
        x: Math.min(d.startX, p.x),
        y: Math.min(d.startY, p.y),
        w: Math.abs(dx),
        h: Math.abs(dy),
      };
      setMarquee(box);
      const hits = design.components.filter(
        (c) => c.x + c.w > box.x && c.x < box.x + box.w && c.y + c.h > box.y && c.y < box.y + box.h,
      );
      setSelection(hits.map((c) => c.id));
      return;
    }

    const others = design.components.filter((c) => !d.origin.some((o) => o.id === c.id));
    const vCands = [0, wallW, ...others.flatMap((c) => [c.x, c.x + c.w, c.x + c.w / 2])];
    const hCands = [0, wallH, ...others.flatMap((c) => [c.y, c.y + c.h, c.y + c.h / 2])];
    const grid = design.settings.gridSize;

    if (d.mode === "move") {
      let ddx = dx;
      let ddy = dy;
      const primary = d.origin[0];
      if (design.settings.snap) {
        const gx = [...vCands, ...gridSeries(wallW, grid)];
        const gy = [...hCands, ...gridSeries(wallH, grid)];
        const leftSnap = snapValue(primary.x + dx, gx);
        const rightSnap = snapValue(primary.x + primary.w + dx, gx);
        if (Math.abs(leftSnap.value - (primary.x + dx)) <= Math.abs(rightSnap.value - (primary.x + primary.w + dx)))
          ddx = leftSnap.value - primary.x;
        else ddx = rightSnap.value - primary.w - primary.x;
        const botSnap = snapValue(primary.y + dy, gy);
        const topSnap = snapValue(primary.y + primary.h + dy, gy);
        if (Math.abs(botSnap.value - (primary.y + dy)) <= Math.abs(topSnap.value - (primary.y + primary.h + dy)))
          ddy = botSnap.value - primary.y;
        else ddy = topSnap.value - primary.h - primary.y;
      }
      const updates = d.origin.map((o) => ({
        id: o.id,
        patch: { x: round(o.x + ddx), y: round(o.y + ddy) },
      }));
      updateComponents(updates, { commit: false });
      const moved = d.origin[0];
      setGuides({
        v: uniqNear([moved.x + ddx, moved.x + moved.w + ddx], vCands),
        h: uniqNear([moved.y + ddy, moved.y + moved.h + ddy], hCands),
      });
      return;
    }

    // resize
    const o = d.origin[0];
    const entry = CATALOG[o.type];
    let { x, y, w, h } = o;
    const handle = d.handle!;
    const snapX = (v: number) =>
      design.settings.snap ? snapValue(v, [...vCands, ...gridSeries(wallW, grid)]).value : v;
    const snapY = (v: number) =>
      design.settings.snap ? snapValue(v, [...hCands, ...gridSeries(wallH, grid)]).value : v;

    if (handle.includes("e") && entry.resizable.w) {
      const right = snapX(o.x + o.w + dx);
      w = Math.max(entry.min.w, Math.min(entry.max.w, right - o.x));
    }
    if (handle.includes("w") && entry.resizable.w) {
      const left = snapX(o.x + dx);
      const right = o.x + o.w;
      w = Math.max(entry.min.w, Math.min(entry.max.w, right - left));
      x = right - w;
    }
    if (handle.includes("n") && entry.resizable.h) {
      const top = snapY(o.y + o.h + dy);
      h = Math.max(entry.min.h, Math.min(entry.max.h, top - o.y));
    }
    if (handle.includes("s") && entry.resizable.h) {
      const bottom = snapY(o.y + dy);
      const top = o.y + o.h;
      h = Math.max(entry.min.h, Math.min(entry.max.h, top - bottom));
      y = top - h;
    }
    updateComponents(
      [{ id: o.id, patch: { x: round(x), y: round(y), w: round(w), h: round(h) } }],
      { commit: false },
    );
    setGuides({ v: uniqNear([x, x + w], vCands), h: uniqNear([y, y + h], hCands) });
  };

  const endDrag = () => {
    drag.current = null;
    setGuides({ v: [], h: [] });
    setMarquee(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!selection.length) return;
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        removeSelected();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 6 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0;
        updateComponents(
          selected.map((c) => ({ id: c.id, patch: { x: c.x + dx, y: c.y + dy } })),
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selection, selected, removeSelected, duplicateSelected, updateComponents]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const type = e.dataTransfer.getData("application/x-owk-component") as ComponentType;
    if (!type || !(type in CATALOG)) return;
    const p = toWall(e.clientX, e.clientY);
    const entry = CATALOG[type];
    addComponent(type, {
      x: round(p.x - entry.w / 2),
      y: design.settings.snap ? entry.defaultY : round(p.y - entry.h / 2),
    });
  };

  const isEmpty = design.components.length === 0;

  return (
    <div ref={viewportRef} className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center p-8"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
      <div className="relative w-full max-w-[1180px]">
        <svg
          ref={svgRef}
          id="owk-canvas"
          viewBox={viewBox}
          className="w-full select-none rounded-[2px] bg-paper shadow-drawing"
          style={{ aspectRatio: `${wallW + MARGIN * 2} / ${wallH + MARGIN * 2}` }}
          onPointerDown={onPointerDownCanvas}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <defs>
            <pattern id="owk-grid" width={design.settings.gridSize} height={design.settings.gridSize} patternUnits="userSpaceOnUse">
              <path
                d={`M ${design.settings.gridSize} 0 L 0 0 0 ${design.settings.gridSize}`}
                fill="none"
                stroke="var(--drawing-grid)"
                strokeWidth={0.2}
              />
            </pattern>
          </defs>

          {/* wall */}
          <rect x={0} y={0} width={wallW} height={wallH} fill="var(--drawing-wall)" />
          {design.settings.grid && (
            <rect x={0} y={0} width={wallW} height={wallH} fill="url(#owk-grid)" />
          )}
          <rect
            x={0}
            y={0}
            width={wallW}
            height={wallH}
            fill="none"
            stroke="var(--drawing-ink)"
            strokeWidth={0.9}
            vectorEffect="non-scaling-stroke"
          />
          {/* floor line */}
          <line
            x1={-MARGIN * 0.5}
            y1={wallH}
            x2={wallW + MARGIN * 0.5}
            y2={wallH}
            stroke="var(--drawing-ink)"
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          />

          {/* components */}
          {design.components.map((comp) => {
            const top = wallH - comp.y - comp.h;
            const isSel = selection.includes(comp.id);
            return (
              <g key={comp.id} transform={`translate(${comp.x} ${top})`}>
                <g
                  onPointerDown={(e) => onPointerDownComponent(e, comp)}
                  className="cursor-move"
                >
                  <ComponentArt comp={comp} />
                  <rect x={0} y={0} width={comp.w} height={comp.h} fill="transparent" />
                </g>
                {isSel && (
                  <g>
                    <rect
                      x={-0.75}
                      y={-0.75}
                      width={comp.w + 1.5}
                      height={comp.h + 1.5}
                      fill="none"
                      stroke="var(--drawing-select)"
                      strokeWidth={1.1}
                      vectorEffect="non-scaling-stroke"
                    />
                    {handlesFor(comp).map((hd) => (
                      <rect
                        key={hd.id}
                        x={hd.x - 1.6}
                        y={hd.y - 1.6}
                        width={3.2}
                        height={3.2}
                        fill="var(--drawing-wall)"
                        stroke="var(--drawing-select)"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                        className={hd.cursor}
                        onPointerDown={(e) => onPointerDownHandle(e, comp, hd.id)}
                      />
                    ))}
                    <text
                      x={comp.w / 2}
                      y={-3.5}
                      textAnchor="middle"
                      fill="var(--drawing-ink)"
                      className="font-ui"
                      fontSize={5}
                    >
                      {inchLabel(comp.w)} × {inchLabel(comp.h)} in
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* snap guides */}
          {guides.v.map((v) => (
            <line
              key={`v${v}`}
              x1={v}
              y1={-MARGIN * 0.4}
              x2={v}
              y2={wallH + MARGIN * 0.4}
              stroke="var(--drawing-guide)"
              strokeWidth={0.6}
              strokeDasharray="3 2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {guides.h.map((hv) => (
            <line
              key={`h${hv}`}
              x1={-MARGIN * 0.4}
              y1={wallH - hv}
              x2={wallW + MARGIN * 0.4}
              y2={wallH - hv}
              stroke="var(--drawing-guide)"
              strokeWidth={0.6}
              strokeDasharray="3 2"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {marquee && marquee.w > 1 && (
            <rect
              x={marquee.x}
              y={wallH - marquee.y - marquee.h}
              width={marquee.w}
              height={marquee.h}
              fill="var(--drawing-guide)"
              fillOpacity={0.06}
              stroke="var(--drawing-guide)"
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* dimension lines */}
          <DimensionLine
            x1={0}
            y1={wallH + MARGIN * 0.55}
            x2={wallW}
            y2={wallH + MARGIN * 0.55}
            label={toFeetInches(wallW)}
          />
          <DimensionLine
            x1={-MARGIN * 0.55}
            y1={wallH}
            x2={-MARGIN * 0.55}
            y2={0}
            vertical
            label={toFeetInches(wallH)}
          />
          <WallHandle
            cx={wallW}
            cy={wallH + MARGIN * 0.55}
            cursor="cursor-ew-resize"
            label="Drag to change wall width"
            onPointerDown={(e) => onPointerDownWall(e, "w")}
          />
          <WallHandle
            cx={-MARGIN * 0.55}
            cy={0}
            cursor="cursor-ns-resize"
            label="Drag to change wall height"
            onPointerDown={(e) => onPointerDownWall(e, "h")}
          />

          {selected.length === 1 && (
            <DimensionLine
              x1={selected[0].x}
              y1={wallH - selected[0].y + 8}
              x2={selected[0].x + selected[0].w}
              y2={wallH - selected[0].y + 8}
              label={`${inchLabel(selected[0].w)} in`}
              subtle
            />
          )}
        </svg>

        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="max-w-xs text-center">
              <p className="font-display text-2xl text-ink">An empty wall</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Drag a component from the library, or click one to place it. Drag the ends of the
                dimension lines to resize the wall. Prefer a head start? Pick a template from the
                Design menu.
              </p>
            </div>
          </div>
        )}

        {dragOver && (
          <div className="pointer-events-none absolute inset-0 rounded-[2px] border border-dashed border-ink/40" />
        )}
      </div>
      </div>

      <ScrollBars vp={vp} zoom={zoom} offset={offset} setOffset={setOffset} />

      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1 border border-line bg-shell/95 px-1 py-1 text-[11px] shadow-panel">
        <button
          onClick={() => zoomBy(1 / 1.2)}
          className="border border-transparent px-2 py-0.5 text-ink hover:border-line"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="w-12 text-center tabular-nums text-ink-soft">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => zoomBy(1.2)}
          className="border border-transparent px-2 py-0.5 text-ink hover:border-line"
          aria-label="Zoom in"
        >
          +
        </button>
        <span className="mx-0.5 h-4 w-px bg-line" />
        <button
          onClick={resetView}
          className="border border-transparent px-2 py-0.5 text-ink hover:border-line"
        >
          Fit
        </button>
      </div>
    </div>
  );
}

function WallHandle({
  cx,
  cy,
  cursor,
  label,
  onPointerDown,
}: {
  cx: number;
  cy: number;
  cursor: string;
  label: string;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <g className={cursor} onPointerDown={onPointerDown}>
      <title>{label}</title>
      <circle cx={cx} cy={cy} r={5} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={1.8}
        fill="var(--drawing-wall)"
        stroke="var(--drawing-ink)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

/** Contextual scroll bars: appear only when the zoomed drawing extends past the view. */
function ScrollBars({
  vp,
  zoom,
  offset,
  setOffset,
}: {
  vp: { w: number; h: number };
  zoom: number;
  offset: { x: number; y: number };
  setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}) {
  const axis = (size: number, off: number) => {
    const lo = Math.min(0, off);
    const hi = Math.max(size, off + size * zoom);
    const range = hi - lo;
    const visible = size > 0 && range - size > 1;
    return { visible, range, start: (0 - lo) / range, len: size / range };
  };
  const hx = axis(vp.w, offset.x);
  const vy = axis(vp.h, offset.y);

  const drag = (e: React.PointerEvent, dir: "x" | "y") => {
    e.preventDefault();
    e.stopPropagation();
    const a = dir === "x" ? hx : vy;
    const size = dir === "x" ? vp.w : vp.h;
    const startP = dir === "x" ? e.clientX : e.clientY;
    const startO = offset[dir];
    // bound pan to the content: offset in [size - size*zoom, 0] when zoomed in
    const minO = Math.min(0, size - size * zoom);
    const maxO = Math.max(0, size - size * zoom);
    const move = (ev: PointerEvent) => {
      const d = ((dir === "x" ? ev.clientX : ev.clientY) - startP) * (a.range / size);
      const next = Math.min(maxO, Math.max(minO, startO - d));
      setOffset((o) => ({ ...o, [dir]: next }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const thumb = "absolute rounded-full bg-ink/30 transition-colors hover:bg-ink/50";
  return (
    <>
      {hx.visible && (
        <div className="absolute bottom-1 left-2 right-3 z-10 h-2" aria-label="Horizontal scroll">
          <div
            className={thumb + " top-0 h-2 cursor-grab"}
            style={{ left: `${hx.start * 100}%`, width: `${hx.len * 100}%` }}
            onPointerDown={(e) => drag(e, "x")}
          />
        </div>
      )}
      {vy.visible && (
        <div className="absolute bottom-3 right-1 top-2 z-10 w-2" aria-label="Vertical scroll">
          <div
            className={thumb + " left-0 w-2 cursor-grab"}
            style={{ top: `${vy.start * 100}%`, height: `${vy.len * 100}%` }}
            onPointerDown={(e) => drag(e, "y")}
          />
        </div>
      )}
    </>
  );
}

function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  label,
  vertical,
  subtle,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  vertical?: boolean;
  subtle?: boolean;
}) {
  const stroke = subtle ? "var(--drawing-guide)" : "var(--drawing-ink)";
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={0.4} vectorEffect="non-scaling-stroke" />
      <line
        x1={vertical ? x1 - 2 : x1}
        y1={vertical ? y1 : y1 - 2}
        x2={vertical ? x1 + 2 : x1}
        y2={vertical ? y1 : y1 + 2}
        stroke={stroke}
        strokeWidth={0.4}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={vertical ? x2 - 2 : x2}
        y1={vertical ? y2 : y2 - 2}
        x2={vertical ? x2 + 2 : x2}
        y2={vertical ? y2 : y2 + 2}
        stroke={stroke}
        strokeWidth={0.4}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={vertical ? mx - 3 : mx}
        y={vertical ? my : my + 6}
        textAnchor="middle"
        fill={stroke}
        fontSize={5}
        className="font-ui"
        transform={vertical ? `rotate(-90 ${mx - 3} ${my})` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

function handlesFor(comp: KComponent): { id: Handle; x: number; y: number; cursor: string }[] {
  const entry = CATALOG[comp.type];
  const out: { id: Handle; x: number; y: number; cursor: string }[] = [];
  if (entry.resizable.w) {
    out.push({ id: "w", x: 0, y: comp.h / 2, cursor: "cursor-ew-resize" });
    out.push({ id: "e", x: comp.w, y: comp.h / 2, cursor: "cursor-ew-resize" });
  }
  if (entry.resizable.h) {
    out.push({ id: "n", x: comp.w / 2, y: 0, cursor: "cursor-ns-resize" });
    out.push({ id: "s", x: comp.w / 2, y: comp.h, cursor: "cursor-ns-resize" });
  }
  if (entry.resizable.w && entry.resizable.h) {
    out.push({ id: "nw", x: 0, y: 0, cursor: "cursor-nwse-resize" });
    out.push({ id: "ne", x: comp.w, y: 0, cursor: "cursor-nesw-resize" });
    out.push({ id: "sw", x: 0, y: comp.h, cursor: "cursor-nesw-resize" });
    out.push({ id: "se", x: comp.w, y: comp.h, cursor: "cursor-nwse-resize" });
  }
  return out;
}

function gridSeries(max: number, step: number) {
  const out: number[] = [];
  for (let v = 0; v <= max; v += step) out.push(v);
  return out;
}

function uniqNear(values: number[], candidates: number[]) {
  const out = new Set<number>();
  for (const v of values)
    for (const c of candidates) if (Math.abs(c - v) < 0.35) out.add(round(c));
  return Array.from(out);
}

function round(v: number) {
  return Math.round(v * 4) / 4;
}
