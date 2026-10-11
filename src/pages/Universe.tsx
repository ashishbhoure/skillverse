import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { catById, categories, DATA, fmtMinutes, pathById, skillById, skills, skillsByCat } from "../lib/data";
import { catLayout, curvePath, skillLayout, WORLD } from "../lib/layout";
import { skillProgress, summarize, useStore, type State } from "../lib/store";
import type { Level, Skill } from "../lib/types";
import { Bar, Dot, Icon, StatusBadge } from "../components/ui";

type LevelFilter = "all" | Level | "experimental";
interface View { x: number; y: number; k: number }
const K_MIN = 0.16, K_MAX = 3.2;
const clampK = (k: number) => Math.max(K_MIN, Math.min(K_MAX, k));

interface GraphProps {
  st: State; level: LevelFilter; showDone: boolean; showProgress: boolean; showUpcoming: boolean; showLinks: boolean;
  pathIds: string[] | null; focusCat: string | null; kq: number;
  onCluster: (id: string) => void; onHover: (id: string | null, el?: Element) => void; onOpen: (id: string) => void;
}

const Graph = memo(function Graph(p: GraphProps) {
  const { st, level, showDone, showProgress, showUpcoming, showLinks, pathIds, focusCat, kq } = p;
  const inPath = useMemo(() => new Set(pathIds ?? []), [pathIds]);
  const matches = (s: Skill) => level === "all" || (level === "experimental" ? s.experimental || !!s.emerging : s.level === level);
  const catHidden = (id: string) => !showUpcoming && !!catById[id].emerging;
  const labelScale = Math.max(1, Math.min(3.4, 0.9 / kq)); const rs = Math.min(2.4, Math.pow(labelScale, 0.75));
  const showSkillLabels = kq >= 0.85;
  const pathPoints = pathIds && pathIds.length > 1 ? pathIds.map((id) => skillLayout[id]).filter(Boolean) : null;

  return (
    <>
      <defs>
        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="glow-s" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {showLinks && DATA.links.map(([a, b], i) => {
        if (catHidden(a) || catHidden(b)) return null;
        const up = catById[a].emerging || catById[b].emerging;
        return <path key={a + b} d={curvePath(catLayout[a], catLayout[b], i % 2 ? 0.16 : -0.16)} fill="none" stroke="var(--border-strong)" strokeWidth={1.6} strokeOpacity={0.75} strokeDasharray={up ? "7 7" : undefined} />;
      })}
      {skills.map((s) => {
        if (catHidden(s.category)) return null; const a = catLayout[s.category], b = skillLayout[s.id];
        return <line key={s.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={catById[s.category].color} strokeOpacity={focusCat && focusCat !== s.category ? 0.07 : 0.28} strokeWidth={1} />;
      })}
      {pathPoints && <>
        <polyline points={pathPoints.map((q) => `${q.x},${q.y}`).join(" ")} fill="none" stroke="var(--glow)" strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" opacity={0.8} filter="url(#glow-s)" />
        <polyline className="flow" points={pathPoints.map((q) => `${q.x},${q.y}`).join(" ")} fill="none" stroke="#fff" strokeWidth={1.4} strokeOpacity={0.6} />
      </>}
      {skills.map((s) => {
        if (catHidden(s.category)) return null;
        const pr = skillProgress(s, st); const pos = skillLayout[s.id]; const c = catById[s.category];
        if ((pr.status === "done" && !showDone) || (pr.status === "progress" && !showProgress)) return null;
        let op = matches(s) ? 1 : 0.1;
        if (pathIds && !inPath.has(s.id)) op = Math.min(op, 0.22);
        if (focusCat && focusCat !== s.category) op = Math.min(op, 0.35);
        const fill = pr.status === "done" ? "var(--done)" : pr.status === "progress" ? "var(--bg-base)" : "var(--bg-overlay)";
        const stroke = pr.status === "progress" ? "var(--progress)" : pr.status === "done" ? "var(--done)" : s.emerging ? "var(--new)" : "var(--border-strong)";
        const show = showSkillLabels || (focusCat === s.category) || (inPath.has(s.id) && kq >= 0.5);
        return (
          <g key={s.id} className="node" opacity={op} role="link" aria-label={`${s.name}, ${c.name}, ${pr.status === "done" ? "completed" : pr.status === "progress" ? "in progress" : "not started"}`}
            tabIndex={focusCat === s.category ? 0 : -1}
            onClick={() => p.onOpen(s.id)} onKeyDown={(e) => { if (e.key === "Enter") p.onOpen(s.id); }}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") p.onHover(s.id, e.currentTarget); }} onPointerLeave={() => p.onHover(null)}
            onFocus={(e) => p.onHover(s.id, e.currentTarget)} onBlur={() => p.onHover(null)}>
            <circle cx={pos.x} cy={pos.y} r={16} fill="transparent" />
            <circle className="core" cx={pos.x} cy={pos.y} r={(inPath.has(s.id) ? 8.5 : 6.5) * Math.min(1.8, rs)} fill={fill} stroke={stroke} strokeWidth={pr.status === "progress" ? 2.6 : 1.6} strokeDasharray={s.emerging && pr.status === "none" ? "3 2" : undefined} filter={pr.status === "progress" ? "url(#glow-s)" : undefined} />
            {show && <text className="node-label" x={pos.x + (pos.x >= a(s).x ? 12 : -12)} y={pos.y + 4} textAnchor={pos.x >= a(s).x ? "start" : "end"} style={{ fontSize: 12 * Math.min(1.6, labelScale * 0.8) }}>{s.name}</text>}
          </g>
        );
      })}
      {categories.map((c) => {
        if (catHidden(c.id)) return null; const n = catLayout[c.id]; const list = skillsByCat[c.id] ?? [];
        const dn = list.filter((s) => skillProgress(s, st).status === "done").length;
        const dim = focusCat && focusCat !== c.id;
        return (
          <g key={c.id} className="cluster" opacity={dim ? 0.4 : 1} role="button" tabIndex={0} aria-label={`${c.name} cluster, ${list.length} skills`} onClick={() => p.onCluster(c.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.onCluster(c.id); } }}>
            <circle className="ring" cx={n.x} cy={n.y} r={36 * rs} fill={c.color} fillOpacity={0.18} stroke={c.color} strokeWidth={2.4} strokeDasharray={c.emerging ? "6 5" : undefined} filter="url(#glow)" />
            <circle cx={n.x} cy={n.y} r={10 * rs} fill={c.color} />
            <text className="cluster-label" x={n.x} y={n.y + 36 * rs + 26 * labelScale ** 0.5} textAnchor="middle" style={{ fontSize: 16 * labelScale }}>{c.name}</text>
            <text className="cluster-sub" x={n.x} y={n.y + 36 * rs + 26 * labelScale ** 0.5 + 17 * labelScale} textAnchor="middle" style={{ fontSize: 11 * Math.min(2, labelScale) }}>{c.emerging ? "NEW TRACK" : `${dn} / ${list.length} SKILLS`}</text>
          </g>
        );
      })}
    </>
  );
});
const a = (s: Skill) => catLayout[s.category];

export default function Universe() {
  const [params, setParams] = useSearchParams(); const nav = useNavigate(); const st = useStore(); const sum = useMemo(() => summarize(st), [st]);
  const wrap = useRef<HTMLDivElement>(null); const g = useRef<SVGGElement>(null);
  const view = useRef<View>({ x: 0, y: 0, k: 0.4 }); const [vs, setVs] = useState<View>(view.current);
  const [size, setSize] = useState({ w: 1000, h: 700 }); const inited = useRef(false); const raf = useRef(0); const moved = useRef(false);
  const [level, setLevel] = useState<LevelFilter>("all");
  const [layers, setLayers] = useState({ done: true, progress: true, upcoming: true, links: true });
  const [hover, setHover] = useState<{ id: string; left: number; top: number } | null>(null);
  const [sideOpen, setSideOpen] = useState(false); const [dragging, setDragging] = useState(false);
  const focusCat = params.get("focus"); const pathId = params.get("path");
  const pathIds = pathId ? pathById(pathId)?.skills ?? null : null;

  const commit = useCallback((v: View) => {
    view.current = v; g.current?.setAttribute("transform", `translate(${v.x} ${v.y}) scale(${v.k})`);
    cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => setVs({ ...view.current }));
  }, []);
  const fit = useCallback((w = size.w, h = size.h) => {
    const k = clampK(Math.min(w / WORLD.w, h / WORLD.h) * 0.96);
    commit({ k, x: (w - WORLD.w * k) / 2, y: (h - WORLD.h * k) / 2 });
  }, [commit, size]);
  const tween = useRef(0);
  const flyTo = useCallback((wx: number, wy: number, k: number) => {
    cancelAnimationFrame(tween.current);
    const from = { ...view.current }; const to = { k: clampK(k), x: size.w / 2 - wx * clampK(k), y: size.h / 2 - wy * clampK(k) }; const t0 = performance.now(); const dur = 650;
    const step = (t: number) => {
      const u = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - u, 3);
      commit({ k: from.k + (to.k - from.k) * e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e });
      if (u < 1) tween.current = requestAnimationFrame(step);
    };
    tween.current = requestAnimationFrame(step);
  }, [commit, size]);
  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    const v = view.current; const k = clampK(v.k * factor); const f = k / v.k;
    commit({ k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f });
  }, [commit]);

  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => { const r = el.getBoundingClientRect(); setSize({ w: r.width, h: r.height }); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  useEffect(() => { if (!inited.current && size.w > 50) { inited.current = true; if (focusCat && catLayout[focusCat]) { const n = catLayout[focusCat]; commit({ k: 1, x: size.w / 2 - n.x, y: size.h / 2 - n.y }); } else fit(size.w, size.h); } }, [size, fit, commit, focusCat]);
  useEffect(() => { if (inited.current && focusCat && catLayout[focusCat]) { const n = catLayout[focusCat]; flyTo(n.x, n.y, Math.max(0.9, Math.min(1.5, Math.min(size.w, size.h) / (n.r * 2.6)))); } }, [focusCat]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = () => setSideOpen((o) => !o); window.addEventListener("skillverse:toggle-side", t); return () => window.removeEventListener("skillverse:toggle-side", t); }, []);

  // wheel + pointer gestures
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); const r = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0) zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const pts = new Map<number, { x: number; y: number }>(); let startDist = 0, startK = 1, last = { x: 0, y: 0 }, down = { x: 0, y: 0 };
    const rel = (e: PointerEvent) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const move = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, rel(e));
      if (pts.size === 2) {
        const [p1, p2] = [...pts.values()]; const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (!startDist) { startDist = d; startK = view.current.k; } else zoomAt((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (startK * (d / startDist)) / view.current.k);
        moved.current = true; return;
      }
      const p = rel(e); if (Math.hypot(p.x - down.x, p.y - down.y) > 5) { moved.current = true; setDragging(true); setHover(null); }
      if (moved.current) { const v = view.current; commit({ ...v, x: v.x + p.x - last.x, y: v.y + p.y - last.y }); }
      last = p;
    };
    const up = (e: PointerEvent) => { pts.delete(e.pointerId); startDist = 0; if (!pts.size) { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); setDragging(false); setTimeout(() => (moved.current = false), 0); } };
    const downH = (e: PointerEvent) => {
      if ((e.target as Element).closest(".ov")) return;
      cancelAnimationFrame(tween.current); const p = rel(e); pts.set(e.pointerId, p); last = p; down = p; if (pts.size === 1) moved.current = false;
      window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    };
    el.addEventListener("pointerdown", downH);
    return () => { el.removeEventListener("wheel", onWheel); el.removeEventListener("pointerdown", downH); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [commit, zoomAt]);

  const onKey = (e: React.KeyboardEvent) => {
    const c = { x: size.w / 2, y: size.h / 2 }; const v = view.current;
    if (e.key === "+" || e.key === "=") zoomAt(c.x, c.y, 1.25); else if (e.key === "-") zoomAt(c.x, c.y, 0.8); else if (e.key === "0") fit();
    else if (e.key === "ArrowLeft") commit({ ...v, x: v.x + 80 }); else if (e.key === "ArrowRight") commit({ ...v, x: v.x - 80 });
    else if (e.key === "ArrowUp") commit({ ...v, y: v.y + 80 }); else if (e.key === "ArrowDown") commit({ ...v, y: v.y - 80 });
  };

  const setParam = (k: string, v: string | null) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); setParams(n, { replace: true }); };
  const selectCat = useCallback((id: string) => { setSideOpen(false); setParams((p) => { const n = new URLSearchParams(p); if (n.get("focus") === id) { const c = catLayout[id]; flyTo(c.x, c.y, Math.max(0.9, Math.min(1.5, Math.min(size.w, size.h) / (c.r * 2.6)))); } else n.set("focus", id); return n; }, { replace: true }); }, [flyTo, setParams, size]);
  const onHover = useCallback((id: string | null, el?: Element) => {
    if (!id || !el || !wrap.current) { setHover(null); return; }
    if (moved.current) return;
    const r = el.getBoundingClientRect(), w = wrap.current.getBoundingClientRect();
    setHover({ id, left: Math.min(Math.max(10, r.right - w.left + 14), w.width - 316), top: Math.min(Math.max(70, r.top - w.top - 20), w.height - 200) });
  }, []);
  const onOpen = useCallback((id: string) => { if (!moved.current) nav(`/skill/${id}`); }, [nav]);
  const kq = Math.round(vs.k * 10) / 10 || 0.1;
  const hs = hover ? skillById[hover.id] : null; const hp = hs ? skillProgress(hs, st) : null;
  const fc = focusCat ? catById[focusCat] : null;
  const cont = sum.lastSkill ?? skillById["html/syntax"]; const cp = skillProgress(cont, st);
  const doneCount = sum.resourcesDone;

  return (
    <div className="uni">
      <aside className={`side ${sideOpen ? "open" : ""}`} aria-label="Categories">
        <div className="side-card"><span className="eyebrow">Overall progress</span>
          <div className="row"><span className="h1">{Math.round((doneCount / sum.resourcesTotal) * 100)}%</span><span className="mono muted" style={{ fontSize: 13 }}>{doneCount} / {sum.resourcesTotal.toLocaleString()}</span></div>
          <Bar pct={doneCount / sum.resourcesTotal} color="var(--done)" /></div>
        <div className="cat-list"><span className="eyebrow" style={{ marginBottom: 6 }}>Categories</span>
          {categories.map((c) => { const b = sum.byCategory[c.id]; return (
            <button key={c.id} className={`cat-row ${focusCat === c.id ? "active" : ""}`} onClick={() => selectCat(c.id)}><Dot c={c.color} /><span>{c.name}</span>
              <span className={`n ${c.emerging ? "new" : ""}`}>{c.emerging ? "NEW" : `${b?.skillsDone ?? 0}/${c.count}`}</span></button>); })}
        </div>
        <div className="cat-list"><span className="eyebrow" style={{ marginBottom: 6 }}>Show</span>
          {([["done", "Completed"], ["progress", "In progress"], ["upcoming", "Upcoming skills"], ["links", "Prerequisite lines"]] as const).map(([k, l]) => (
            <button key={k} className="toggle-row" role="switch" aria-checked={layers[k]} onClick={() => setLayers((x) => ({ ...x, [k]: !x[k] }))}><span className="grow">{l}</span><span className={`switch ${layers[k] ? "on" : ""}`} /></button>))}
        </div>
      </aside>

      <div className={`canvas-wrap ${dragging ? "dragging" : ""}`} ref={wrap} tabIndex={0} onKeyDown={onKey} role="application" aria-label="Skill universe map. Drag to pan, scroll or pinch to zoom, plus and minus keys zoom, zero fits all." onDoubleClick={(e) => { if (!(e.target as Element).closest(".ov, .node, .cluster")) { const r = wrap.current!.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, 1.6); } }}>
        <svg><g ref={g}><Graph st={st} level={level} showDone={layers.done} showProgress={layers.progress} showUpcoming={layers.upcoming} showLinks={layers.links} pathIds={pathIds} focusCat={focusCat} kq={kq} onCluster={selectCat} onHover={onHover} onOpen={onOpen} /></g></svg>

        <div className="ov ov-tl"><div className="chips" role="group" aria-label="Filter by level">
          {([["all", "All levels"], ["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"], ["experimental", "New & experimental"]] as const).map(([k, l]) => (
            <button key={k} className={`chip ${level === k ? "active" : ""}`} aria-pressed={level === k} onClick={() => setLevel(k)}>{k !== "all" && <Dot c={k === "beginner" ? "var(--done)" : k === "intermediate" ? "var(--progress)" : k === "advanced" ? "var(--hot)" : "var(--new)"} />}{l}</button>))}
          <select className="chip" aria-label="Highlight a learning path" value={pathId ?? ""} onChange={(e) => setParam("path", e.target.value || null)} style={{ paddingRight: 10 }}>
            <option value="">Highlight a path…</option>{DATA.paths.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        </div></div>

        <div className="ov ov-tr">
          <div className="continue"><span className="eyebrow">{sum.lastSkill ? "Continue learning" : "Start here"}</span>
            <div><div className="h2">{cont.name}</div><div className="muted" style={{ fontSize: 12 }}>{catById[cont.category].name}</div></div>
            <Bar pct={cp.pct} color="var(--progress)" />
            <Link className="btn primary" to={`/skill/${cont.id}`}>{sum.lastSkill ? `Resume · ${cp.done} of ${cp.total} done` : "Begin your journey"}<Icon n="right" s={14} /></Link></div>
        </div>

        {fc && <div className="ov ov-sheet"><div className="hover-card pin" style={{ position: "static", ["--c" as string]: fc.color, width: "100%" }}>
          <div className="row"><Dot c={fc.color} /><span className="h3 grow">{fc.name}</span><button className="btn ghost sm" onClick={() => setParam("focus", null)} aria-label="Clear focus"><Icon n="x" s={14} /></button></div>
          <span className="sub" style={{ fontSize: 12 }}>{fc.blurb}</span>
          <Bar pct={(sum.byCategory[fc.id]?.done ?? 0) / Math.max(1, sum.byCategory[fc.id]?.total ?? 1)} color={fc.color} />
          <div className="row"><Link className="btn secondary sm" to={`/roadmap?cat=${fc.id}`}>Open roadmap</Link><Link className="btn ghost sm" to={`/skill/${skillsByCat[fc.id][0].id}`}>Start first skill</Link></div></div></div>}

        {hs && hp && hover && <div className="hover-card" style={{ left: hover.left, top: hover.top, ["--c" as string]: catById[hs.category].color }} role="tooltip">
          <div className="row"><Dot c={catById[hs.category].color} /><span className="h3 grow">{hs.name}</span><StatusBadge status={hp.status} />{hs.emerging && <span className="badge new">New</span>}{hs.experimental && <span className="badge exp">Exp.</span>}</div>
          <span className="sub" style={{ fontSize: 12, lineHeight: "16px" }}>{hs.description || `${catById[hs.category].name} · curated resources`}</span>
          <div className="row mono muted" style={{ fontSize: 11 }}><span>{hp.total} RESOURCES</span><span>~{fmtMinutes(hs.minutes)}</span><span>{hs.level.toUpperCase()}</span></div><Bar pct={hp.pct} color="var(--progress)" /></div>}

        <div className="ov ov-bl legend" aria-hidden="true"><span><i className="dot" style={{ ["--c" as string]: "var(--done)" }} />Completed</span><span><i className="dot" style={{ border: "2px solid var(--progress)", background: "transparent" }} />In progress</span><span><i className="dot" style={{ background: "var(--bg-overlay)", border: "1.5px solid var(--border-strong)" }} />Not started</span><span><i className="dot" style={{ border: "1.5px dashed var(--new)", background: "transparent" }} />Upcoming</span></div>

        <div className="ov ov-bc"><div className="glass viewsw" role="navigation" aria-label="View"><Link className="active" to="/">Universe</Link><Link to="/roadmap">Roadmap</Link><Link to="/list">List</Link></div>
          <div className="glass zoom"><button aria-label="Zoom out" onClick={() => zoomAt(size.w / 2, size.h / 2, 0.8)}><Icon n="minus" s={16} /></button><span aria-live="off" title="Click to fit" onClick={() => fit()} style={{ cursor: "pointer" }}>{Math.round(vs.k * 100)}%</span><button aria-label="Zoom in" onClick={() => zoomAt(size.w / 2, size.h / 2, 1.25)}><Icon n="plus" s={16} /></button></div></div>

        <div className="ov ov-br"><Minimap vs={vs} size={size} onGo={(x, y) => flyTo(x, y, view.current.k)} /></div>
      </div>
    </div>
  );
}

function Minimap({ vs, size, onGo }: { vs: View; size: { w: number; h: number }; onGo: (x: number, y: number) => void }) {
  const vx = -vs.x / vs.k, vy = -vs.y / vs.k, vw = size.w / vs.k, vh = size.h / vs.k;
  return (
    <svg className="minimap" viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" onPointerDown={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); const sc = Math.max(WORLD.w / r.width, WORLD.h / r.height); onGo((e.clientX - r.left - (r.width - WORLD.w / sc) / 2) * sc, (e.clientY - r.top - (r.height - WORLD.h / sc) / 2) * sc); }}>
      {categories.map((c) => <circle key={c.id} cx={c.pos[0]} cy={c.pos[1]} r={46} fill={c.color} />)}
      <rect x={vx} y={vy} width={vw} height={vh} fill="rgba(183,165,255,0.08)" stroke="var(--glow)" strokeWidth={22} rx={30} />
    </svg>
  );
}
