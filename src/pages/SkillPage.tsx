import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ask, COACH_SUGGESTIONS } from "../lib/coach";
import { catById, DATA, fmtMinutes, LEVEL_LABEL, neighbours, skillById, skillResources, skillsByCat } from "../lib/data";
import { actions, skillProgress, useStore } from "../lib/store";
import type { Skill, Status } from "../lib/types";
import { Bar, Dot, Icon, ResourceRow, StatusBadge, toast } from "../components/ui";

export default function SkillPage() {
  const { cat = "", slug = "" } = useParams(); const skill = skillById[`${cat}/${slug}`];
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); window.scrollTo({ top: 0 }); }, [cat, slug]);
  if (!skill) return <div className="page"><div className="page-pad"><h1 className="h1">Skill not found</h1><p className="sub">That skill does not exist (anymore).</p><Link className="btn secondary" to="/">Back to the universe</Link></div></div>;
  return <div className="page" ref={scroller}><Detail key={skill.id} skill={skill} /></div>;
}

function Detail({ skill }: { skill: Skill }) {
  const st = useStore(); const p = skillProgress(skill, st); const c = catById[skill.category];
  const [tab, setTab] = useState<"resources" | "notes" | "related">("resources");
  const rs = skillResources(skill); const next = rs.find((r) => !st.done[r.id]);
  const { prev, next: unlocks, index, total } = neighbours(skill);
  const inPaths = DATA.paths.filter((x) => x.skills.includes(skill.id));
  const bookmarked = st.bookmarks.includes(skill.id);
  const ring = skill.emerging?.ring;

  return (
    <div className="detail">
      <aside className="dl-left" aria-label="Learning path">
        <Link to={`/?focus=${c.id}`} className="row sub" style={{ fontWeight: 500 }}><Icon n="left" s={14} /> Back to universe</Link>
        <div><span className="eyebrow">Learning path · {c.name}</span>
          <div className="mini-steps" style={{ marginTop: 10 }}>
            {[...prev, skill, ...unlocks].map((s) => { const sp = skillProgress(s, st); return (
              <Link key={s.id} to={`/skill/${s.id}`} className={`mini-step ${sp.status} ${s.id === skill.id ? "cur" : ""}`} aria-current={s.id === skill.id ? "page" : undefined}>
                <span className="d" /><span className="grow">{s.name}{s.id === skill.id && <div className="mono" style={{ fontSize: 11, color: "var(--progress)", fontWeight: 500 }}>YOU ARE HERE · {Math.round(p.pct * 100)}%</div>}</span></Link>); })}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Skill {index + 1} of {total} in {c.name}</div>
        </div>
        {unlocks.length > 0 && <div className="side-card"><span className="eyebrow">Unlocks</span>{unlocks.map((s) => <Link key={s.id} to={`/skill/${s.id}`} className="row sub"><Dot c="var(--glow)" />{s.name}</Link>)}</div>}
        {inPaths.length > 0 && <div className="side-card"><span className="eyebrow">Part of</span>{inPaths.map((x) => <Link key={x.id} to={`/paths/${x.id}`} className="row sub"><Dot c={x.color} />{x.name}</Link>)}</div>}
      </aside>

      <main className="dl-mid" id="content">
        <div className="crumbs"><Link to={`/?focus=${c.id}`} style={{ color: c.color }}>{c.name}</Link>{skill.group && <><span>/</span><span>{skill.group}</span></>}</div>
        <div><h1 className="display">{skill.name}</h1>
          <p className="lead" style={{ marginTop: 12 }}>{skill.description || `A curated set of resources to learn ${skill.name}.`}</p></div>
        <div className="row wrap">
          <span className="pill">{LEVEL_LABEL[skill.level]}</span><span className="pill">~{fmtMinutes(skill.minutes)} total</span><span className="pill">{rs.length} resources</span>
          {ring && <span className="pill" style={{ color: "var(--new)" }}>Radar: {ring}</span>}<StatusBadge status={p.status as Status} />{skill.experimental && <span className="badge exp">Experimental</span>}
        </div>
        {skill.experimental && <div className="card" style={{ padding: 14, borderColor: "var(--hot)", color: "var(--text-2)" }}><b style={{ color: "var(--hot)" }}>Experimental.</b> This technology is still being added to the web platform. Check browser support before using it in production.</div>}
        <Bar pct={p.pct} color={p.status === "done" ? "var(--done)" : "var(--progress)"} />
        <div className="row wrap">
          {next ? <a className="btn primary" href={next.url} target="_blank" rel="noopener noreferrer">{p.done ? `Continue · resource ${p.done + 1}` : "Start learning"}<Icon n="ext" s={14} /></a> : <span className="badge done">All resources done</span>}
          <button className={`btn secondary ${p.status === "done" ? "on" : ""}`} onClick={() => { actions.setSkillDone(skill, p.status !== "done"); toast(p.status === "done" ? "Marked as not done" : `${skill.name} complete. Nice work!`); }}>{p.status === "done" ? <><Icon n="check" s={14} /> Completed (undo)</> : "Mark skill complete"}</button>
          <button className="btn ghost" aria-pressed={bookmarked} onClick={() => { actions.toggleBookmark(skill.id); toast(bookmarked ? "Removed from saved" : "Saved for later"); }}><Icon n="bookmark" s={14} fill={bookmarked} />{bookmarked ? "Saved" : "Save"}</button>
        </div>

        <div className="lines" role="tablist">{(["resources", "notes", "related"] as const).map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t === "resources" ? "Resources" : t === "notes" ? `Notes${st.notes[skill.id] ? " •" : ""}` : "Related"}</button>)}</div>

        {tab === "resources" && skill.sections.map((sec, i) => sec.resources.length > 0 && (
          <div key={i} className="res-group">
            {sec.title && <><h3 className="h3">{sec.title}</h3>{sec.description && <div className="sub" style={{ fontSize: 13 }}>{sec.description}</div>}</>}
            {sec.resources.map((r) => <ResourceRow key={r.id} r={r} done={!!st.done[r.id]} onToggle={() => actions.toggleResource(r.id)} />)}
          </div>))}

        {tab === "notes" && <div className="res-group"><div className="sub" style={{ fontSize: 13 }}>Private notes, saved in this browser only. Export them from My Progress.</div>
          <textarea className="note" aria-label={`Notes for ${skill.name}`} placeholder="What clicked? What is still fuzzy? Snippets, links, questions…" value={st.notes[skill.id] ?? ""} onChange={(e) => actions.setNote(skill.id, e.target.value)} /></div>}

        {tab === "related" && <div className="res-group">
          <h3 className="h3">More in {c.name}</h3>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>{(skillsByCat[c.id] ?? []).filter((s) => s.id !== skill.id).slice(0, 8).map((s) => <Link key={s.id} to={`/skill/${s.id}`} className="card row" style={{ padding: 12 }}><Dot c={c.color} />{s.name}</Link>)}</div>
        </div>}
      </main>

      <Coach skill={skill} />
    </div>
  );
}

function Coach({ skill }: { skill: Skill }) {
  const st = useStore(); const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([]); const [q, setQ] = useState(""); const [busy, setBusy] = useState(false); const end = useRef<HTMLDivElement>(null);
  const live = !!import.meta.env.VITE_COACH_ENDPOINT;
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs]);
  const send = async (text: string) => {
    const t = text.trim(); if (!t || busy) return; setQ(""); setBusy(true); setMsgs((m) => [...m, { me: true, t }]);
    const a = await ask(skill, t, st); setMsgs((m) => [...m, { me: false, t: a }]); setBusy(false);
  };
  return (
    <aside className="dl-right" aria-label="Skill coach"><div className="coach">
      <div className="row"><span className="logo-glyph" style={{ width: 28, height: 28 }} /><h2 className="h2 grow">Skill coach</h2><span className={`badge ${live ? "done" : "new"}`}>{live ? "LLM" : "Offline"}</span></div>
      <div className="muted" style={{ fontSize: 12 }}>{live ? "Answers come from your configured coach endpoint." : "Rule-based helper that uses your progress. No AI model is connected; set VITE_COACH_ENDPOINT to plug in your own."}</div>
      <div className="chat" aria-live="polite">
        {msgs.length === 0 && <div className="bubble">Hi! I know which resources of <b>{skill.name}</b> you have finished. Ask me what to do next, for a time-boxed plan, or to quiz you.</div>}
        {msgs.map((m, i) => <div key={i} className={`bubble ${m.me ? "me" : ""}`}>{m.t}</div>)}<div ref={end} />
      </div>
      <div className="chips">{COACH_SUGGESTIONS.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>
      <form className="input-row" onSubmit={(e) => { e.preventDefault(); send(q); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Ask about ${skill.name}…`} aria-label="Ask the coach" /><button className="send" aria-label="Send" type="submit"><Icon n="send" s={16} /></button>
      </form>
    </div></aside>
  );
}
