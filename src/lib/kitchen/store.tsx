import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CATALOG, createComponent, newId } from "./catalog";
import type { ComponentType, Design, DesignSettings, KComponent } from "./types";

export type AlignKind = "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom";

interface KitchenApi {
  design: Design;
  selection: string[];
  selected: KComponent[];
  dirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  replaceDesign: (d: Design, opts?: { dirty?: boolean }) => void;
  rename: (name: string) => void;
  setWall: (wall: { width: number; height: number }) => void;
  setSettings: (patch: Partial<DesignSettings>) => void;
  addComponent: (type: ComponentType, at?: { x: number; y: number }) => void;
  updateComponents: (
    updates: { id: string; patch: Partial<KComponent> }[],
    opts?: { commit?: boolean },
  ) => void;
  removeSelected: () => void;
  duplicateSelected: () => void;
  group: () => void;
  ungroup: () => void;
  align: (kind: AlignKind) => void;
  distribute: (axis: "h" | "v") => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  beginTransaction: () => void;
}

const Ctx = createContext<KitchenApi | null>(null);

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function constrain(comp: KComponent, wall: Design["wall"]): KComponent {
  const entry = CATALOG[comp.type];
  const w = clamp(comp.w, entry.min.w, Math.min(entry.max.w, wall.width));
  const h = clamp(comp.h, entry.min.h, Math.min(entry.max.h, wall.height));
  return {
    ...comp,
    w,
    h,
    x: clamp(comp.x, 0, Math.max(0, wall.width - w)),
    y: clamp(comp.y, 0, Math.max(0, wall.height - h)),
  };
}

export function KitchenProvider({
  initial,
  children,
}: {
  initial: Design;
  children: ReactNode;
}) {
  const [design, setDesignState] = useState<Design>(initial);
  const [selection, setSelection] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const past = useRef<Design[]>([]);
  const future = useRef<Design[]>([]);
  const [histVersion, setHistVersion] = useState(0);

  const commit = useCallback((next: Design | ((d: Design) => Design), record = true) => {
    setDesignState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      if (record) {
        past.current = [...past.current.slice(-49), prev];
        future.current = [];
      }
      return { ...value, updatedAt: new Date().toISOString() };
    });
    setDirty(true);
    setHistVersion((v) => v + 1);
  }, []);

  const beginTransaction = useCallback(() => {
    setDesignState((prev) => {
      past.current = [...past.current.slice(-49), prev];
      future.current = [];
      return prev;
    });
    setHistVersion((v) => v + 1);
  }, []);

  const api = useMemo<KitchenApi>(() => {
    const selected = design.components.filter((c) => selection.includes(c.id));

    const expandGroups = (ids: string[]) => {
      const groupIds = new Set(
        design.components.filter((c) => ids.includes(c.id) && c.groupId).map((c) => c.groupId),
      );
      const out = new Set(ids);
      for (const c of design.components) if (c.groupId && groupIds.has(c.groupId)) out.add(c.id);
      return Array.from(out);
    };

    return {
      design,
      selection,
      selected,
      dirty,
      canUndo: past.current.length > 0,
      canRedo: future.current.length > 0,
      setSelection: (ids) => setSelection(expandGroups(ids)),
      toggleSelection: (id) =>
        setSelection((prev) =>
          expandGroups(prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]),
        ),
      replaceDesign: (d, opts) => {
        past.current = [];
        future.current = [];
        setDesignState(d);
        setSelection([]);
        setDirty(opts?.dirty ?? false);
        setHistVersion((v) => v + 1);
      },
      rename: (name) => commit((d) => ({ ...d, name })),
      setWall: (wall) =>
        commit((d) => ({
          ...d,
          wall,
          components: d.components.map((c) => constrain(c, wall)),
        })),
      setSettings: (patch) => commit((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      addComponent: (type, at) => {
        const entry = CATALOG[type];
        const x = at ? at.x : nextFreeX(design, entry.w, entry.defaultY);
        const comp = constrain(
          createComponent(type, { x, y: at ? at.y : entry.defaultY }),
          design.wall,
        );
        commit((d) => ({ ...d, components: [...d.components, comp] }));
        setSelection([comp.id]);
      },
      updateComponents: (updates, opts) => {
        const record = opts?.commit ?? true;
        commit(
          (d) => ({
            ...d,
            components: d.components.map((c) => {
              const u = updates.find((up) => up.id === c.id);
              return u ? constrain({ ...c, ...u.patch }, d.wall) : c;
            }),
          }),
          record,
        );
      },
      removeSelected: () => {
        commit((d) => ({ ...d, components: d.components.filter((c) => !selection.includes(c.id)) }));
        setSelection([]);
      },
      duplicateSelected: () => {
        const copies = selected.map((c) =>
          constrain({ ...c, id: newId(), x: c.x + 6, y: c.y, groupId: null }, design.wall),
        );
        if (!copies.length) return;
        commit((d) => ({ ...d, components: [...d.components, ...copies] }));
        setSelection(copies.map((c) => c.id));
      },
      group: () => {
        if (selected.length < 2) return;
        const gid = newId("g");
        commit((d) => ({
          ...d,
          groups: [...d.groups, { id: gid, name: `Group ${d.groups.length + 1}` }],
          components: d.components.map((c) =>
            selection.includes(c.id) ? { ...c, groupId: gid } : c,
          ),
        }));
      },
      ungroup: () => {
        const gids = new Set(selected.map((c) => c.groupId).filter(Boolean));
        if (!gids.size) return;
        commit((d) => ({
          ...d,
          groups: d.groups.filter((g) => !gids.has(g.id)),
          components: d.components.map((c) => (gids.has(c.groupId ?? "") ? { ...c, groupId: null } : c)),
        }));
      },
      align: (kind) => {
        if (selected.length < 2) return;
        const minX = Math.min(...selected.map((c) => c.x));
        const maxX = Math.max(...selected.map((c) => c.x + c.w));
        const minY = Math.min(...selected.map((c) => c.y));
        const maxY = Math.max(...selected.map((c) => c.y + c.h));
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const updates = selected.map((c) => {
          switch (kind) {
            case "left":
              return { id: c.id, patch: { x: minX } };
            case "right":
              return { id: c.id, patch: { x: maxX - c.w } };
            case "hcenter":
              return { id: c.id, patch: { x: cx - c.w / 2 } };
            case "bottom":
              return { id: c.id, patch: { y: minY } };
            case "top":
              return { id: c.id, patch: { y: maxY - c.h } };
            default:
              return { id: c.id, patch: { y: cy - c.h / 2 } };
          }
        });
        api.updateComponents(updates);
      },
      distribute: (axis) => {
        if (selected.length < 3) return;
        const sorted = [...selected].sort((a, b) => (axis === "h" ? a.x - b.x : a.y - b.y));
        const start = axis === "h" ? sorted[0].x : sorted[0].y;
        const last = sorted[sorted.length - 1];
        const end = axis === "h" ? last.x + last.w : last.y + last.h;
        const total = sorted.reduce((s, c) => s + (axis === "h" ? c.w : c.h), 0);
        const gap = (end - start - total) / (sorted.length - 1);
        let cursor = start;
        const updates = sorted.map((c) => {
          const patch = axis === "h" ? { x: cursor } : { y: cursor };
          cursor += (axis === "h" ? c.w : c.h) + gap;
          return { id: c.id, patch };
        });
        api.updateComponents(updates);
      },
      undo: () => {
        const prev = past.current.pop();
        if (!prev) return;
        setDesignState((cur) => {
          future.current = [...future.current, cur];
          return prev;
        });
        setDirty(true);
        setHistVersion((v) => v + 1);
      },
      redo: () => {
        const next = future.current.pop();
        if (!next) return;
        setDesignState((cur) => {
          past.current = [...past.current, cur];
          return next;
        });
        setDirty(true);
        setHistVersion((v) => v + 1);
      },
      markSaved: () => setDirty(false),
      beginTransaction,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, selection, dirty, commit, beginTransaction, histVersion]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function nextFreeX(design: Design, width: number, y: number) {
  const row = design.components
    .filter((c) => c.y < y + 12 && c.y + c.h > y)
    .sort((a, b) => a.x - b.x);
  let x = 0;
  for (const c of row) {
    if (x + width <= c.x) break;
    x = c.x + c.w;
  }
  return Math.min(x, Math.max(0, design.wall.width - width));
}

export function useKitchen() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useKitchen must be used inside KitchenProvider");
  return ctx;
}
