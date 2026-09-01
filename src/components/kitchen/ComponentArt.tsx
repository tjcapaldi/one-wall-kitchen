import { finishOf } from "@/lib/kitchen/catalog";
import type { KComponent } from "@/lib/kitchen/types";

/**
 * Architectural line-art for one component, drawn in local inches with a
 * top-left origin. Fills come from the finish palette; everything else is line.
 */
export function ComponentArt({ comp }: { comp: KComponent }) {
  const f = finishOf(comp.finish);
  const { w, h } = comp;
  const sw = 0.5;
  const common = { stroke: f.line, strokeWidth: sw, fill: "none", vectorEffect: "non-scaling-stroke" as const };

  switch (comp.type) {
    case "base-cabinet":
    case "upper-cabinet":
    case "tall-cabinet":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          {doorFronts(comp, f)}
        </g>
      );
    case "drawer-cabinet": {
      const rows = Math.max(2, Math.min(4, Math.round(h / 11)));
      const rh = h / rows;
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          {Array.from({ length: rows }).map((_, i) => (
            <g key={i}>
              <rect x={1} y={i * rh + 1} width={w - 2} height={rh - 2} {...common} />
              {hardwareMark(comp, f, w / 2, i * rh + rh / 2, "h")}
            </g>
          ))}
        </g>
      );
    }
    case "open-shelving": {
      const shelves = Math.max(2, Math.round(h / 12));
      return (
        <g>
          {Array.from({ length: shelves }).map((_, i) => {
            const y = (h / (shelves - 1 || 1)) * i;
            return (
              <rect
                key={i}
                x={0}
                y={Math.min(y, h - 1.5)}
                width={w}
                height={1.5}
                {...common}
                fill={f.fill}
              />
            );
          })}
          <line x1={2} y1={0} x2={2} y2={h} {...common} strokeDasharray="1 2" />
          <line x1={w - 2} y1={0} x2={w - 2} y2={h} {...common} strokeDasharray="1 2" />
        </g>
      );
    }
    case "countertop":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          <line x1={0} y1={h * 0.45} x2={w} y2={h * 0.45} {...common} />
        </g>
      );
    case "refrigerator":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} rx={0.6} />
          <line x1={0} y1={h * 0.36} x2={w} y2={h * 0.36} {...common} />
          <line x1={w * 0.5} y1={h * 0.36} x2={w * 0.5} y2={h} {...common} />
          <line x1={w * 0.5 - 2.5} y1={4} x2={w * 0.5 - 2.5} y2={h * 0.3} {...common} strokeWidth={1.2} />
          <line x1={w * 0.5 + 2.5} y1={h * 0.44} x2={w * 0.5 + 2.5} y2={h * 0.7} {...common} strokeWidth={1.2} />
        </g>
      );
    case "range":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          <rect x={1.5} y={h * 0.28} width={w - 3} height={h * 0.62} {...common} />
          <line x1={1.5} y1={h * 0.2} x2={w - 1.5} y2={h * 0.2} {...common} strokeWidth={1.2} />
          {[0.28, 0.72].map((cx) => (
            <circle key={cx} cx={w * cx} cy={h * 0.1} r={Math.min(w, h) * 0.06} {...common} />
          ))}
        </g>
      );
    case "oven":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          <rect x={2} y={h * 0.28} width={w - 4} height={h * 0.6} {...common} />
          <line x1={2} y1={h * 0.18} x2={w - 2} y2={h * 0.18} {...common} strokeWidth={1.2} />
        </g>
      );
    case "dishwasher":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          <line x1={0} y1={h * 0.18} x2={w} y2={h * 0.18} {...common} />
          <line x1={2} y1={h * 0.1} x2={w - 2} y2={h * 0.1} {...common} strokeWidth={1.2} />
          <rect x={3} y={h * 0.3} width={w - 6} height={h * 0.55} {...common} strokeDasharray="1 2" />
        </g>
      );
    case "microwave":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          <rect x={2} y={2} width={w * 0.62} height={h - 4} {...common} />
          <line x1={w - 5} y1={3} x2={w - 5} y2={h - 3} {...common} strokeDasharray="1 1.5" />
        </g>
      );
    case "range-hood":
      return (
        <g>
          <path
            d={`M ${w * 0.28} 0 L ${w * 0.72} 0 L ${w * 0.72} ${h * 0.45} L ${w} ${h * 0.8} L ${w} ${h} L 0 ${h} L 0 ${h * 0.8} L ${w * 0.28} ${h * 0.45} Z`}
            {...common}
            fill={f.fill}
          />
          <line x1={0} y1={h * 0.86} x2={w} y2={h * 0.86} {...common} />
        </g>
      );
    case "window":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill="none" strokeWidth={0.9} />
          <rect x={2} y={2} width={w - 4} height={h - 4} {...common} />
          <line x1={w / 2} y1={2} x2={w / 2} y2={h - 2} {...common} />
          <line x1={2} y1={h / 2} x2={w - 2} y2={h / 2} {...common} />
        </g>
      );
    case "door":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill="none" strokeWidth={0.9} />
          <rect x={2.5} y={2.5} width={w - 5} height={h - 2.5} {...common} strokeDasharray="2 2" />
          <circle cx={w - 6} cy={h * 0.52} r={1.2} {...common} />
        </g>
      );
    case "sink":
      return sinkArt(comp, f);

    case "pendant":
      return (
        <g>
          <line x1={w / 2} y1={0} x2={w / 2} y2={h * 0.62} {...common} />
          <path
            d={`M ${w / 2 - w / 2} ${h} L ${w / 2 - w * 0.18} ${h * 0.62} L ${w / 2 + w * 0.18} ${h * 0.62} L ${w} ${h} Z`}
            {...common}
            fill={f.fill}
          />
        </g>
      );
    case "plant":
      return (
        <g>
          <path
            d={`M ${w * 0.28} ${h * 0.55} L ${w * 0.72} ${h * 0.55} L ${w * 0.64} ${h} L ${w * 0.36} ${h} Z`}
            {...common}
            fill={f.fill}
          />
          {[0.2, 0.5, 0.8].map((t, i) => (
            <path
              key={i}
              d={`M ${w / 2} ${h * 0.55} Q ${w * t} ${h * 0.2} ${w * (0.1 + t * 0.8)} ${h * 0.02}`}
              {...common}
            />
          ))}
        </g>
      );
    case "stool":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h * 0.12} {...common} fill={f.fill} />
          <line x1={w * 0.18} y1={h * 0.12} x2={w * 0.1} y2={h} {...common} />
          <line x1={w * 0.82} y1={h * 0.12} x2={w * 0.9} y2={h} {...common} />
          <line x1={w * 0.14} y1={h * 0.62} x2={w * 0.86} y2={h * 0.62} {...common} />
        </g>
      );
    default:
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          <line x1={0} y1={0} x2={w} y2={h} {...common} strokeDasharray="1 2" />
        </g>
      );
  }
}

function doorFronts(comp: KComponent, f: ReturnType<typeof finishOf>) {
  const { w, h } = comp;
  const common = { stroke: f.line, strokeWidth: 0.5, fill: "none", vectorEffect: "non-scaling-stroke" as const };
  const leaves = doorLeaves(comp);
  const lw = w / leaves;
  const side = comp.handleSide ?? "center";
  return (
    <g>
      {Array.from({ length: leaves }).map((_, i) => {
        const x = i * lw;
        // Single door: handle sits on the chosen side of the door.
        // Double doors: "center" puts a handle at each inner (meeting) edge.
        const inset = 3;
        let hx: number;
        if (leaves === 1) hx = side === "left" ? x + inset : x + lw - inset;
        else if (side === "center") hx = i === 0 ? x + lw - inset : x + inset;
        else if (side === "left") hx = x + inset;
        else hx = x + lw - inset;
        return (
          <g key={i}>
            {leaves === 2 && i === 1 && <line x1={x} y1={0} x2={x} y2={h} {...common} />}
            {comp.doorStyle === "shaker" && (
              <rect x={x + 2.5} y={2.5} width={lw - 5} height={h - 5} {...common} />
            )}
            {comp.doorStyle === "panel" && (
              <>
                <rect x={x + 2} y={2} width={lw - 4} height={h - 4} {...common} />
                <rect x={x + 4.5} y={4.5} width={lw - 9} height={h - 9} {...common} />
              </>
            )}
            {comp.doorStyle === "glass" && (
              <>
                <rect x={x + 2.5} y={2.5} width={lw - 5} height={h - 5} {...common} />
                <line x1={x + 2.5} y1={h / 2} x2={x + lw - 2.5} y2={h / 2} {...common} />
                <line x1={x + lw / 2} y1={2.5} x2={x + lw / 2} y2={h - 2.5} {...common} />
              </>
            )}
            {hardwareMark(comp, f, hx, h * 0.5, "v")}
          </g>
        );
      })}
    </g>
  );
}


function hardwareMark(
  comp: KComponent,
  f: ReturnType<typeof finishOf>,
  cx: number,
  cy: number,
  dir: "h" | "v",
) {
  const stroke = { stroke: f.ink, strokeWidth: 1, fill: "none", vectorEffect: "non-scaling-stroke" as const };
  if (!comp.hardware || comp.hardware === "none") return null;
  if (comp.hardware === "knob") return <circle cx={cx} cy={cy} r={0.9} fill={f.ink} />;
  const len = comp.hardware === "bar" ? 8 : 4;
  return dir === "v" ? (
    <line x1={cx} y1={cy - len / 2} x2={cx} y2={cy + len / 2} {...stroke} />
  ) : (
    <line x1={cx - len / 2} y1={cy} x2={cx + len / 2} y2={cy} {...stroke} />
  );
}
