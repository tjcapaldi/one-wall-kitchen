import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { newId } from "./catalog";

export type Tool = "pointer" | "measure";
export interface Pt {
  x: number;
  y: number;
}
/** A tape-measure reading in wall inches (y up, origin bottom-left). */
export interface Measurement {
  id: string;
  a: Pt;
  b: Pt;
  locked: boolean;
}

interface MeasureApi {
  tool: Tool;
  setTool: (t: Tool) => void;
  measures: Measurement[];
  setMeasures: (fn: (m: Measurement[]) => Measurement[]) => void;
  selectedMeasure: string | null;
  selectMeasure: (id: string | null) => void;
  current: Measurement | null;
  update: (id: string, patch: Partial<Measurement>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
}

const Ctx = createContext<MeasureApi | null>(null);

export const measureLength = (m: Measurement) => Math.hypot(m.b.x - m.a.x, m.b.y - m.a.y);

export function MeasureProvider({ children }: { children: ReactNode }) {
  const [tool, setTool] = useState<Tool>("pointer");
  const [measures, setMeasuresState] = useState<Measurement[]>([]);
  const [selectedMeasure, selectMeasure] = useState<string | null>(null);

  const api = useMemo<MeasureApi>(
    () => ({
      tool,
      setTool,
      measures,
      setMeasures: (fn) => setMeasuresState(fn),
      selectedMeasure,
      selectMeasure,
      current: measures.find((m) => m.id === selectedMeasure) ?? null,
      update: (id, patch) => setMeasuresState((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      remove: (id) => {
        setMeasuresState((ms) => ms.filter((m) => m.id !== id));
        selectMeasure((s) => (s === id ? null : s));
      },
      duplicate: (id) => {
        const src = measures.find((m) => m.id === id);
        if (!src) return;
        const copy: Measurement = {
          id: newId("m"),
          a: { x: src.a.x + 6, y: src.a.y - 6 },
          b: { x: src.b.x + 6, y: src.b.y - 6 },
          locked: src.locked,
        };
        setMeasuresState((ms) => [...ms, copy]);
        selectMeasure(copy.id);
      },
    }),
    [tool, measures, selectedMeasure],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useMeasure() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useMeasure must be used inside MeasureProvider");
  return c;
}
