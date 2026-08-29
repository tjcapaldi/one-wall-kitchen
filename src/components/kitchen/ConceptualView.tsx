import { CATALOG, finishOf } from "@/lib/kitchen/catalog";
import type { Design } from "@/lib/kitchen/types";

/**
 * Conceptual axonometric visualisation derived from the same design model as the
 * 2D drawing. It is a study, not the authoritative drawing.
 */
export function ConceptualView({ design }: { design: Design }) {
  const { width: W, height: H } = design.wall;
  const k = 0.42; // depth foreshortening
  const maxDepth = 30;
  const pad = 14;
  const vbW = W + maxDepth * k + pad * 2;
  const vbH = H + maxDepth * k + pad * 2;

  const sorted = [...design.components].sort((a, b) => a.depth - b.depth);

  return (
    <svg viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`} className="w-full">
      <rect x={-pad} y={-pad} width={vbW} height={vbH} fill="var(--paper)" />
      {/* floor */}
      <path
        d={`M 0 ${H} L ${W} ${H} L ${W + maxDepth * k} ${H + maxDepth * k} L ${maxDepth * k} ${H + maxDepth * k} Z`}
        fill="var(--line)"
        stroke="var(--drawing-ink)"
        strokeWidth={0.4}
        vectorEffect="non-scaling-stroke"
      />
      {/* wall */}
      <rect x={0} y={0} width={W} height={H} fill="var(--drawing-wall)" stroke="var(--drawing-ink)" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />

      {sorted.map((c) => {
        const f = finishOf(c.finish);
        const top = H - c.y - c.h;
        const d = Math.min(c.depth, maxDepth) * k;
        const line = { stroke: f.line, strokeWidth: 0.4, vectorEffect: "non-scaling-stroke" as const };
        if (CATALOG[c.type].category === "openings") {
          return (
            <rect key={c.id} x={c.x} y={top} width={c.w} height={c.h} fill="none" {...line} strokeWidth={0.7} />
          );
        }
        return (
          <g key={c.id}>
            {/* top face */}
            <path
              d={`M ${c.x} ${top} L ${c.x + c.w} ${top} L ${c.x + c.w + d} ${top - d} L ${c.x + d} ${top - d} Z`}
              fill={f.fill}
              fillOpacity={0.85}
              {...line}
            />
            {/* side face */}
            <path
              d={`M ${c.x + c.w} ${top} L ${c.x + c.w + d} ${top - d} L ${c.x + c.w + d} ${top + c.h - d} L ${c.x + c.w} ${top + c.h} Z`}
              fill={f.fill}
              fillOpacity={0.6}
              {...line}
            />
            {/* front face */}
            <rect x={c.x} y={top} width={c.w} height={c.h} fill={f.fill} {...line} />
          </g>
        );
      })}
    </svg>
  );
}
