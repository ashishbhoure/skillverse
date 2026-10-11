import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { categories, DATA, LEVEL_LABEL, skillsByCat } from "../lib/data";
import { skillProgress, useStore } from "../lib/store";
import { CoffeeButton, Dot, StatusBadge, toast } from "../components/ui";

/** Accessible, searchable list of every skill: the non-visual alternative to the universe map. */
export function ListView() {
  const st = useStore(); const [q, setQ] = useState("");
  const f = q.trim().toLowerCase();
  const groups = useMemo(() => categories.map((c) => ({ c, list: (skillsByCat[c.id] ?? []).filter((s) => !f || (s.name + " " + s.description).toLowerCase().includes(f)) })).filter((g) => g.list.length), [f]);
  return (
    <div className="page"><div className="page-pad" style={{ maxWidth: 960 }}>
      <span className="eyebrow">List view</span><h1 className="display" style={{ margin: "8px 0 16px" }}>All skills</h1>
      <div className="row wrap" style={{ marginBottom: 20 }}><input className="field grow" style={{ minWidth: 220 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter skills…" aria-label="Filter skills" /><span className="muted">{groups.reduce((n, g) => n + g.list.length, 0)} skills</span></div>
      {groups.map(({ c, list }) => (
        <details key={c.id} className="list-cat" open={!!f || undefined}>
          <summary><Dot c={c.color} />{c.name}<span className="muted mono" style={{ fontSize: 12, marginLeft: "auto" }}>{list.length}</span></summary>
          {list.map((s) => <Link key={s.id} to={`/skill/${s.id}`} className="list-row"><span className="grow">{s.name}</span>{s.emerging && <span className="badge new">New</span>}{s.experimental && <span className="badge exp">Exp.</span>}<StatusBadge status={skillProgress(s, st).status} /><span className="pill">{LEVEL_LABEL[s.level]}</span></Link>)}
        </details>))}
    </div></div>
  );
}

const REPO = (import.meta.env.VITE_REPO_URL as string | undefined) || "https://github.com/andreasbm/web-skills";

export function Community() {
  const [f, setF] = useState({ name: "", category: "ai", why: "", url: "" });
  const json = JSON.stringify({ name: f.name, category: f.category, why: f.why, resources: f.url ? [f.url] : [] }, null, 2);
  return (
    <div className="page"><div className="page-pad" style={{ maxWidth: 960 }}>
      <span className="eyebrow">Community</span><h1 className="display" style={{ margin: "8px 0 12px" }}>Shape the universe</h1>
      <p className="lead">Skillverse is a living map. Missing something important? Suggest a skill or a better resource and open an issue or pull request in the repository.</p>
      <section className="sec card" style={{ padding: 22 }}><h2 className="h2">Suggest a skill</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
          <input className="field" placeholder="Skill name, e.g. WebTransport" aria-label="Skill name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <select className="field" aria-label="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <input className="field" placeholder="Best resource URL" aria-label="Resource URL" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
          <input className="field" placeholder="Why does it matter?" aria-label="Why it matters" value={f.why} onChange={(e) => setF({ ...f, why: e.target.value })} />
        </div>
        <pre className="card mono" style={{ padding: 14, margin: 0, overflow: "auto", fontSize: 12, color: "var(--text-2)" }}>{json}</pre>
        <div className="row wrap"><button className="btn secondary" onClick={() => navigator.clipboard?.writeText(json).then(() => toast("Copied suggestion JSON"), () => toast("Copy failed"))}>Copy JSON</button><a className="btn primary" href={`${REPO}/issues/new`} target="_blank" rel="noopener noreferrer">Open an issue</a></div></section>
      <section className="sec"><h2 className="h2">What is new in Skillverse 2.0</h2>
        <ul className="sub" style={{ lineHeight: "26px", margin: 0, paddingLeft: 20 }}>
          <li>An interactive constellation map with pan, zoom, filters and highlighted learning paths.</li>
          <li>{DATA.stats.emerging} new skills across AI &amp; LLM engineering, WebGPU, edge, Rust/WASM, modern CSS, security and more.</li>
          <li>Role-based learning paths, a ⌘K command palette, per-resource progress, notes, streaks and achievements, all stored locally with export/import.</li>
          <li>Installable, works offline, and has an accessible list view for screen readers.</li>
        </ul></section>
      <section className="sec card" style={{ padding: 22 }}><h2 className="h2">Support the project</h2><p className="sub" style={{ margin: 0, maxWidth: 640 }}>Skillverse is free, open source and has no ads or tracking. If it helps your learning, you can buy me a coffee. It is never required.</p><div><CoffeeButton className="btn coffee" label="Buy me a coffee" /></div></section>
      <section className="sec"><h2 className="h2">Credits</h2><p className="sub" style={{ margin: 0 }}>The original {DATA.stats.skills - DATA.stats.emerging} skills and their resource lists come from <a href="https://github.com/andreasbm/web-skills" target="_blank" rel="noopener noreferrer" style={{ color: "var(--glow)" }}>Web Skills by Andreas Mehlsen</a> (MIT licence). Skillverse adds new tracks, a new layout and new features. Resource durations and levels are estimates.</p></section>
    </div></div>
  );
}

export function NotFound() { return <div className="page"><div className="page-pad"><h1 className="display">Lost in space</h1><p className="lead">That page does not exist.</p><Link className="btn primary" to="/">Back to the universe</Link></div></div>; }
