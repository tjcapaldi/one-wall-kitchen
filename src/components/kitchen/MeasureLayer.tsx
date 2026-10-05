import { useEffect, useRef, useState } from "react";
import { newId } from "@/lib/kitchen/catalog";
import { inchLabel, toFeetInches } from "@/lib/kitchen/format";
import { measureLength, useMeasure, type Measurement, type Pt } from "@/lib/kitchen/measure";

export const TAPE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><path d='M1 1v8M1 1h8' stroke='%23000' stroke-width='1.5' fill='none'/><g transform='translate(8 8)'><rect x='0.5' y='0.5' width='15' height='15' rx='3' fill='%23f4f1ea' stroke='%23222' stroke-width='1.3'/><circle cx='8' cy='8' r='3.2' fill='none' stroke='%23222' stroke-width='1.1'/><path d='M15.5 12.5h4v3h-4' fill='%23f4f1ea' stroke='%23222' stroke-width='1.1'/></g></svg>`,
).replace(/%2523/g, "%23")}") 1 1, crosshair`;

export function measureLabel(len: number) {
  return `${inchLabel(len)} in · ${toFeetInches(len)}`;
}

/** Tape-measure readings drawn on top of the wall. Coordinates are wall inches (y up). */
export function MeasureLayer({
  toWall,
  wallH,
  extent,
  snap,
  onPointerTool,
}: {
  toWall: (cx: number, cy: number) => Pt;
  wallH: number;
  extent: { x: number; y: number; w: number; h: number };
  snap: (p: Pt) => Pt;
  onPointerTool: () => void;
}) {
  const { tool, measures, setMeasures, selectedMeasure, selectMeasure } = useMeasure();
  const [pending, setPending] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  // click-click mode: the free end follows the cursor until the next click
  useEffect(() => {
    if (!pending) return;
    const move = (e: PointerEvent) => {
      const p = snap(toWall(e.clientX, e.clientY));
      setMeasures((ms) => ms.map((m) => (m.id === pending ? { ...m, b: p } : m)));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [pending, snap, toWall, setMeasures]);

  // cancel pending / leave tool with Escape
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pendingRef.current) {
        const id = pendingRef.current;
        setMeasures((ms) => ms.filter((m) => m.id !== id));
        setPending(null);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [setMeasures]);

  useEffect(() => {
    if (tool !== "measure" && pendingRef.current) {
      const id = pendingRef.current;
      setMeasures((ms) => ms.filter((m) => m.id !== id));
      setPending(null);
    }
  }, [tool, setMeasures]);

  const update = (id: string, patch: Partial<Measurement>) =>
    setMeasures((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const onOverlayDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onPointerTool();
    const p = snap(toWall(e.clientX, e.clientY));
    if (pending) {
      update(pending, { b: p });
      selectMeasure(pending);
      setPending(null);
      return;
    }
    const hadUnlocked = measures.some((m) => !m.locked);
    const id = newId("m");
    setMeasures((ms) => [...ms.filter((m) => m.locked), { id, a: p, b: p, locked: false }]);
    selectMeasure(id);
    const sx = e.clientX;
    const sy = e.clientY;
    let moved = false;
    const move = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 4) moved = true;
      if (moved) update(id, { b: snap(toWall(ev.clientX, ev.clientY)) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (moved) return;
      if (hadUnlocked) {
        // a plain click just clears the previous reading
        setMeasures((ms) => ms.filter((m) => m.id !== id));
        selectMeasure(null);
      } else {
        setPending(id);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startDrag = (e: React.PointerEvent, m: Measurement, part: "a" | "b" | "line") => {
    if (e.button !== 0 || pending) return;
    e.stopPropagation();
    onPointerTool();
    selectMeasure(m.id);
    const start = toWall(e.clientX, e.clientY);
    const move = (ev: PointerEvent) => {
      const p = toWall(ev.clientX, ev.clientY);
      if (part === "line") {
        const d = snap({ x: p.x - start.x, y: p.y - start.y });
        update(m.id, {
          a: { x: m.a.x + d.x, y: m.a.y + d.y },
          b: { x: m.b.x + d.x, y: m.b.y + d.y },
        });
      } else update(m.id, { [part]: snap(p) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <g>
      {tool === "measure" && (
        <rect
          x={extent.x}
          y={extent.y}
          width={extent.w}
          height={extent.h}
          fill="transparent"
          onPointerDown={onOverlayDown}
        />
      )}
      {measures.map((m) => {
        const ax = m.a.x;
        const ay = wallH - m.a.y;
        const bx = m.b.x;
        const by = wallH - m.b.y;
        const sel = m.id === selectedMeasure;
        const show = sel || hover === m.id;
        const len = measureLength(m);
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        let ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
        if (ang > 90 || ang < -90) ang += 180;
        const label = measureLabel(len);
        const lw = label.length * 2.4 + 4;
        const isPending = m.id === pending;
        return (
          <g
            key={m.id}
            onPointerEnter={() => setHover(m.id)}
            onPointerLeave={() => setHover((h) => (h === m.id ? null : h))}
            style={isPending ? { pointerEvents: "none" } : undefined}
          >
            <line
              x1={ax}
              y1={ay}
              x2={bx}
              y2={by}
              stroke="transparent"
              strokeWidth={14}
              vectorEffect="non-scaling-stroke"
              className="cursor-move"
              onPointerDown={(e) => startDrag(e, m, "line")}
            />
            <line
              x1={ax}
              y1={ay}
              x2={bx}
              y2={by}
              stroke="var(--drawing-accent, var(--drawing-ink))"
              strokeWidth={sel ? 1.6 : 1.1}
              strokeDasharray="4 2"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
            {len > 0.01 && (
              <g transform={`translate(${mx} ${my}) rotate(${ang})`} pointerEvents="none">
                <rect
                  x={-lw / 2}
                  y={-9.5}
                  width={lw}
                  height={7}
                  rx={1}
                  fill="var(--color-paper, #fff)"
                  stroke="var(--drawing-ink)"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
                <text y={-4.4} textAnchor="middle" fontSize={4.2} fill="var(--drawing-ink)" className="font-ui">
                  {label}
                </text>
              </g>
            )}
            {(["a", "b"] as const).map((k) => (
              <circle
                key={k}
                cx={k === "a" ? ax : bx}
                cy={k === "a" ? ay : by}
                r={sel ? 2.2 : 1.8}
                fill="var(--color-paper, #fff)"
                stroke="var(--drawing-ink)"
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
                className="cursor-grab"
                onPointerDown={(e) => startDrag(e, m, k)}
              />
            ))}
            {show && !isPending && len > 6 && (
              <g
                transform={`translate(${mx} ${my}) rotate(${ang}) translate(0 6)`}
                className="cursor-move"
                onPointerDown={(e) => startDrag(e, m, "line")}
              >
                <title>Drag to move measurement</title>
                <circle r={3} fill="var(--drawing-ink)" />
                <path
                  d="M-1.8 0H1.8M0 -1.8V1.8M-1.8 0l.7-.6M-1.8 0l.7.6M1.8 0l-.7-.6M1.8 0l-.7.6M0 -1.8l-.6.7M0 -1.8l.6.7M0 1.8l-.6-.7M0 1.8l.6-.7"
                  stroke="var(--color-paper, #fff)"
                  strokeWidth={0.5}
                  fill="none"
                />
              </g>
            )}
            {m.locked && (
              <g transform={`translate(${bx + 3} ${by - 7})`} pointerEvents="none">
                <rect x={0} y={2} width={4} height={3} fill="var(--drawing-ink)" />
                <path d="M0.9 2V1.2a1.1 1.1 0 0 1 2.2 0V2" stroke="var(--drawing-ink)" strokeWidth={0.5} fill="none" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
