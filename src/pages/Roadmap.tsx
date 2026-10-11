import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { catById, categories, DATA, pathById, skillById, skillsByCat } from "../lib/data";
import { summarize, useStore } from "../lib/store";
import type { Skill } from "../lib/types";
import { Bar, Dot, SkillCard } from "../components/ui";

const PREVIEW = 6;

export default function Roadmap() {
  const [params, setParams] = useSearchParams(); const st = useStore(); const sum = useMemo(() => summarize(st), [st]);
  const pathId = params.get("path"); const focus = params.get("cat");
  const [compact, setCompact] = useState(false); const [open, setOpen] = useState<Record<string, boolean>>({});
  const sc = useRef<HTMLDivElement>(null); const [vp, setVp] = useState({ left: 0, width: 1 }); const dragged = useRef(false); const [dragging, setDragging] = useState(false);

  const cols = useMemo(() => {
    if (pathId) {
      const p = pathById(pathId); if (!p) return [];
      const by: Record<string, Skill[]> = {}; for (const id of p.skills) { const s = skillById[id]; (by[s.category] ||= []).push(s); }
      return Object.entries(by).map(([id, list]) => ({ cat: catById[id], list }));
    }
    return categories.map((c) => ({ cat: c, list: skillsByCat[c.id] ?? [] }));
  }, [pathId]);

  const update = () => { const e = sc.current; if (!e) return; setVp({ left: e.scrollLeft / e.scrollWidth, width: e.clientWidth / e.scrollWidth }); };
  useEffect(() => { update(); const e = sc.current; if (!e) return; const ro = new ResizeObserver(update); ro.observe(e); return () => ro.disconnect(); }, [cols, compact, open]);
  useEffect(() => { if (focus) document.getElementById("col-" + focus)?.scrollIntoView({ inline: "start", behavior: "smooth", block: "nearest" }); }, [focus]);

  useEffect(() => {
    const el = sc.current; if (!el) return; let sx = 0, sl = 0, on = false;
    const down = (e: PointerEvent) => { if (e.pointerType !== "mouse" || e.button !== 0) return; on = true; dragged.current = false; sx = e.clientX; sl = el.scrollLeft; };
    const move = (e: PointerEvent) => { if (!on) return; const d = e.clientX - sx; if (Math.abs(d) > 5) { dragged.current = true; setDragging(true); } if (dragged.current) el.scrollLeft = sl - d; };
    const up = () => { on = false; setDragging(false); setTimeout(() => (dragged.current = false), 0); };
    const click = (e: MouseEvent) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); } };
    el.addEventListener("pointerdown", down); window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); el.addEventListener("click", click, true);
    return () => { el.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); el.removeEventListener("click", click, true); };
  }, []);

  const setPath = (id: string | null) => { const n = new URLSearchParams(params); if (id) n.set("path", id); else n.delete("path"); n.delete("cat"); setParams(n, { replace: true }); };
  const total = cols.reduce((n, c) => n + Math.max(1, c.list.length), 0);
  const cur = pathId ? pathById(pathId) : null;

  return (
    <div className="rm">
      <div className="rm-head">
        <div style={{ minWidth: 0 }}><h1 className="h1">{cur ? `${cur.name} roadmap` : "Web Skills roadmap"}</h1><div className="muted">Drag to pan · scroll sideways · click a card to dive in</div></div>
        <div className="grow" />
        <div className="chips" role="group" aria-label="Roadmap filter">
          <button className={`chip ${!pathId ? "active" : ""}`} onClick={() => setPath(null)}>All</button>
          {DATA.paths.map((p) => <button key={p.id} className={`chip ${pathId === p.id ? "active" : ""}`} onClick={() => setPath(p.id)}><Dot c={p.color} />{p.name}</button>)}
        </div>
        <button className="toggle-row" style={{ width: "auto" }} role="switch" aria-checked={compact} onClick={() => setCompact((c) => !c)}><span>Compact</span><span className={`switch ${compact ? "on" : ""}`} /></button>
        <Link className="btn secondary" to="/paths">Browse paths</Link>
      </div>

      <div ref={sc} className={`rm-scroll ${compact ? "compact" : ""} ${dragging ? "dragging" : ""}`} onScroll={update} tabIndex={0} aria-label="Roadmap columns">
        {cols.map(({ cat, list }) => {
          const b = sum.byCategory[cat.id]; const exp = open[cat.id] || !!pathId; const shown = exp ? list : list.slice(0, PREVIEW);
          return (
            <section key={cat.id} className="rm-col" id={"col-" + cat.id} aria-label={cat.name}>
              <div className="rm-col-head">
                <div className="row"><Dot c={cat.color} /><h2 className="h2 grow">{cat.name}</h2><span className="mono muted" style={{ fontSize: 12 }}>{b?.skillsDone ?? 0} / {list.length}</span></div>
                <Bar pct={list.length ? (b?.skillsDone ?? 0) / (pathId ? list.length : cat.count) : 0} color={cat.color} />
              </div>
              {shown.map((s) => <SkillCard key={s.id} skill={s} compact={compact} />)}
              {list.length > PREVIEW && !pathId && <button className="more-card" onClick={() => setOpen((o) => ({ ...o, [cat.id]: !o[cat.id] }))}>{exp ? "Show fewer" : `+ ${list.length - PREVIEW} more skills`}</button>}
            </section>
          );
        })}
        {cols.length === 0 && <div className="muted">That path does not exist.</div>}
      </div>

      <div className="rm-strip"><span className="eyebrow">Overview</span>
        <div className="strip" aria-hidden="true">
          {cols.map(({ cat, list }) => <i key={cat.id} title={cat.name} style={{ flex: Math.max(1, list.length), background: cat.color }} onClick={() => document.getElementById("col-" + cat.id)?.scrollIntoView({ inline: "start", behavior: "smooth", block: "nearest" })} />)}
          <span className="view" style={{ left: `${vp.left * 100}%`, width: `${Math.min(100, vp.width * 100)}%` }} />
        </div>
        <span className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{cols.length} categories · {total} skills</span>
      </div>
    </div>
  );
}
