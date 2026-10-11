import { Link, useParams } from "react-router-dom";
import { catById, DATA, fmtMinutes, pathById, skillById } from "../lib/data";
import { skillProgress, useStore } from "../lib/store";
import type { Path } from "../lib/types";
import { Bar, Dot, Icon, LevelPill } from "../components/ui";

function pathStats(p: Path, st: ReturnType<typeof useStore>) {
  let done = 0, total = 0, minutes = 0, skillsDone = 0;
  for (const id of p.skills) { const s = skillById[id]; const pr = skillProgress(s, st); done += pr.done; total += pr.total; minutes += s.minutes; if (pr.status === "done") skillsDone++; }
  return { done, total, minutes, skillsDone, pct: total ? done / total : 0 };
}

export default function Paths() {
  const st = useStore();
  return (
    <div className="page"><div className="page-pad">
      <span className="eyebrow">Role-based learning paths</span>
      <h1 className="display" style={{ margin: "8px 0 10px" }}>Pick a destination</h1>
      <p className="lead">Curated sequences through the universe, from first tag to production skills. Each path reuses the same skills, so progress is shared everywhere.</p>
      <div className="grid" style={{ marginTop: 28 }}>
        {DATA.paths.map((p) => { const s = pathStats(p, st); return (
          <Link key={p.id} to={`/paths/${p.id}`} className="card path-card" style={{ ["--c" as string]: p.color }}>
            <div className="row"><Dot c={p.color} /><span className="eyebrow">{p.skills.length} skills · ~{fmtMinutes(s.minutes)}</span></div>
            <h2 className="h1">{p.name}</h2><p className="sub" style={{ margin: 0 }}>{p.blurb}</p>
            <div className="row"><div className="grow"><Bar pct={s.pct} color={p.color} /></div><span className="mono muted" style={{ fontSize: 12 }}>{Math.round(s.pct * 100)}%</span></div>
            <span className="row sub" style={{ fontSize: 13, fontWeight: 500 }}>{s.pct > 0 ? "Continue" : "Start path"} <Icon n="right" s={14} /></span>
          </Link>); })}
      </div>
    </div></div>
  );
}

export function PathDetail() {
  const { id = "" } = useParams(); const st = useStore(); const p = pathById(id);
  if (!p) return <div className="page"><div className="page-pad"><h1 className="h1">Path not found</h1><Link className="btn secondary" to="/paths">All paths</Link></div></div>;
  const s = pathStats(p, st);
  const nextIdx = p.skills.findIndex((sid) => skillProgress(skillById[sid], st).status !== "done");
  return (
    <div className="page"><div className="page-pad" style={{ maxWidth: 900 }}>
      <Link to="/paths" className="crumbs"><Icon n="left" s={14} /> All paths</Link>
      <div className="row" style={{ margin: "14px 0 8px" }}><Dot c={p.color} /><span className="eyebrow">Learning path</span></div>
      <h1 className="display">{p.name}</h1><p className="lead" style={{ marginTop: 10 }}>{p.blurb}</p>
      <div className="row wrap" style={{ margin: "20px 0 8px" }}>
        <span className="pill">{p.skills.length} skills</span><span className="pill">~{fmtMinutes(s.minutes)}</span><span className="pill">{s.done}/{s.total} resources</span>
        <div className="grow" style={{ minWidth: 160 }}><Bar pct={s.pct} color={p.color} /></div><span className="mono">{Math.round(s.pct * 100)}%</span>
      </div>
      <div className="row wrap" style={{ marginBottom: 32 }}>
        {nextIdx >= 0 && <Link className="btn primary" to={`/skill/${p.skills[nextIdx]}`}>{s.done ? "Continue" : "Start"}: {skillById[p.skills[nextIdx]].name}<Icon n="right" s={14} /></Link>}
        <Link className="btn secondary" to={`/?path=${p.id}`}>Show in universe</Link><Link className="btn ghost" to={`/roadmap?path=${p.id}`}>Roadmap view</Link>
      </div>
      <div className="timeline">
        {p.skills.map((sid, i) => { const sk = skillById[sid]; const pr = skillProgress(sk, st); const c = catById[sk.category]; return (
          <div key={sid} className={`step ${pr.status}`}>
            <div className="step-dot">{pr.status === "done" ? <Icon n="check" s={13} /> : <span style={{ color: "var(--text-3)", fontSize: 11 }}>{i + 1}</span>}</div>
            <Link to={`/skill/${sid}`} className="step-body grow">
              <Dot c={c.color} /><span className="h3 grow" style={{ minWidth: 140 }}>{sk.name}</span>
              <span className="muted" style={{ fontSize: 12 }}>{c.name}</span><LevelPill level={sk.level} />
              <span className="mono muted" style={{ fontSize: 11 }}>{pr.done}/{pr.total} · ~{fmtMinutes(sk.minutes)}</span>
              {i === nextIdx && <span className="badge progress">Up next</span>}
            </Link>
          </div>); })}
      </div>
    </div></div>
  );
}
