import { doorLeaves, finishOf } from "@/lib/kitchen/catalog";
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
    case "base-cabinet": {
      const drawer = comp.topDrawer !== false;
      const dh = drawer ? Math.min(7, h * 0.2) : 0;
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} {...common} fill={f.fill} />
          {drawer && (
            <g>
              <line x1={0} y1={dh} x2={w} y2={dh} {...common} />
              <rect x={1} y={1} width={w - 2} height={dh - 2} {...common} />
              {hardwareMark(comp, f, w / 2, dh / 2, "h")}
            </g>
          )}
          <g transform={`translate(0 ${dh})`}>
            {doorFronts({ ...comp, h: h - dh }, f)}
          </g>
        </g>
      );
    }
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
      return fridgeArt(comp, f);

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

/**
 * Refrigerator drawn as an elevation: the door configuration and handle
 * visibility both change the line-work.
 */
function fridgeArt(comp: KComponent, f: ReturnType<typeof finishOf>) {
  const { w, h } = comp;
  const line = { stroke: f.line, strokeWidth: 0.5, fill: "none", vectorEffect: "non-scaling-stroke" as const };
  const grip = { stroke: f.ink, strokeWidth: 1.2, fill: "none", vectorEffect: "non-scaling-stroke" as const };
  const style = comp.fridgeStyle ?? "french";
  const show = (comp.fridgeHandles ?? "visible") === "visible";
  const vBar = (x: number, y1: number, y2: number) => <line x1={x} y1={y1} x2={x} y2={y2} {...grip} />;
  const hBar = (y: number, x1: number, x2: number) => <line x1={x1} y1={y} x2={x2} y2={y} {...grip} />;

  const parts: React.ReactNode[] = [];
  if (style === "french") {
    const split = h * 0.62;
    parts.push(<line key="s" x1={0} y1={split} x2={w} y2={split} {...line} />);
    parts.push(<line key="m" x1={w / 2} y1={0} x2={w / 2} y2={split} {...line} />);
    if (show) {
      parts.push(<g key="hh">{vBar(w / 2 - 2.5, h * 0.12, split - 4)}{vBar(w / 2 + 2.5, h * 0.12, split - 4)}{hBar(split + 5, w * 0.34, w * 0.66)}</g>);
    }
  } else if (style === "side-by-side") {
    const split = w * 0.44;
    parts.push(<line key="s" x1={split} y1={0} x2={split} y2={h} {...line} />);
    if (show) {
      parts.push(<g key="hh">{vBar(split - 2.5, h * 0.1, h * 0.5)}{vBar(split + 2.5, h * 0.1, h * 0.5)}</g>);
    }
  } else if (style === "top-freezer") {
    const split = h * 0.3;
    parts.push(<line key="s" x1={0} y1={split} x2={w} y2={split} {...line} />);
    if (show) {
      parts.push(<g key="hh">{vBar(w - 4, split * 0.25, split * 0.8)}{vBar(w - 4, split + 5, h * 0.75)}</g>);
    }
  } else {
    const split = h * 0.68;
    parts.push(<line key="s" x1={0} y1={split} x2={w} y2={split} {...line} />);
    if (show) {
      parts.push(<g key="hh">{vBar(w - 4, h * 0.12, split - 5)}{hBar(split + 5, w * 0.34, w * 0.66)}</g>);
    }
  }

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} {...line} fill={f.fill} rx={0.6} />
      {!show && <rect x={1.2} y={1.2} width={w - 2.4} height={h - 2.4} {...line} strokeDasharray="1 2" />}
      {parts}
    </g>
  );
}

/**
 * Straight-on elevation: the basin sits below the counter and is not visible,
 * so only the faucet and its controls are drawn, over a light footprint mark.
 */
function sinkArt(comp: KComponent, f: ReturnType<typeof finishOf>) {
  const { w, h } = comp;
  const line = { stroke: f.line, strokeWidth: 0.5, fill: "none", vectorEffect: "non-scaling-stroke" as const };
  const deck = h;
  const holes = comp.faucetHoles ?? 1;
  const cx = w / 2;
  const spoutTop = h * 0.18;
  const reach = Math.min(6, w * 0.22);

  return (
    <g>
      {/* subtle basin-width footprint */}
      <line x1={0} y1={deck} x2={w} y2={deck} {...line} strokeDasharray="2 2" strokeWidth={0.4} opacity={0.55} />
      <line x1={0} y1={deck - 1.6} x2={0} y2={deck} {...line} strokeWidth={0.4} opacity={0.55} />
      <line x1={w} y1={deck - 1.6} x2={w} y2={deck} {...line} strokeWidth={0.4} opacity={0.55} />
      {/* faucet: column + gooseneck */}
      <line x1={cx} y1={deck} x2={cx} y2={spoutTop + 1.5} {...line} strokeWidth={0.9} />
      <path
        d={`M ${cx} ${spoutTop + 1.5} C ${cx} ${spoutTop - 1} ${cx + reach} ${spoutTop - 1} ${cx + reach} ${spoutTop + 2.5}`}
        {...line}
        strokeWidth={0.9}
      />
      {/* controls vary with hole count */}
      {holes === 1 && <line x1={cx - 1.6} y1={deck * 0.62} x2={cx + 1.6} y2={deck * 0.62} {...line} strokeWidth={0.9} />}
      {holes >= 2 && (
        <line x1={cx - 5} y1={deck} x2={cx - 5} y2={deck - h * 0.3} {...line} strokeWidth={0.9} />
      )}
      {holes === 3 && (
        <line x1={cx + 5} y1={deck} x2={cx + 5} y2={deck - h * 0.3} {...line} strokeWidth={0.9} />
      )}
      {holes >= 2 && <circle cx={cx - 5} cy={deck - h * 0.3} r={0.8} fill={f.ink} />}
      {holes === 3 && <circle cx={cx + 5} cy={deck - h * 0.3} r={0.8} fill={f.ink} />}
    </g>
  );
}
