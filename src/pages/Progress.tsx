import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { categories, fmtMinutes, skills, skillsByCat } from "../lib/data";
import { actions, dayKey, skillProgress, summarize, useStore } from "../lib/store";
import { Bar, Dot, Icon, toast } from "../components/ui";

export default function Progress() {
  const st = useStore(); const s = useMemo(() => summarize(st), [st]); const file = useRef<HTMLInputElement>(null);
  const pct = s.resourcesDone / s.resourcesTotal;

  // 26-week activity heatmap (Sunday-first columns, ending this week)
  const weeks = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0); const start = new Date(today); start.setDate(start.getDate() - today.getDay() - 25 * 7);
    return Array.from({ length: 26 }, (_, w) => Array.from({ length: 7 }, (_, d) => { const t = new Date(start); t.setDate(start.getDate() + w * 7 + d); const n = t > today ? -1 : s.perDay[dayKey(t.getTime())] || 0; return { n, label: t.toDateString() }; }));
  }, [s]);
  const lvl = (n: number) => (n <= 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);
  const week = useMemo(() => { let n = 0; for (let i = 0; i < 7; i++) n += s.perDay[dayKey(Date.now() - i * 86400000)] || 0; return n; }, [s]);

  const nextUp = useMemo(() => {
    const out = [] as typeof skills;
    for (const c of categories) { const list = skillsByCat[c.id] ?? []; const ps = list.map((k) => skillProgress(k, st).status); if (ps.every((x) => x === "none")) continue; const lastDone = ps.lastIndexOf("done"); const cur = ps.indexOf("progress"); const nx = cur >= 0 ? list[cur] : list.slice(lastDone + 1).find((k) => skillProgress(k, st).status !== "done") ?? list.find((k) => skillProgress(k, st).status !== "done"); if (nx) out.push(nx); }
    if (!out.length) out.push(skills.find((k) => k.id === "html/syntax")!);
    return out.slice(0, 6);
  }, [st]);

  const emergingDone = skills.filter((k) => k.emerging && skillProgress(k, st).status === "done").length;
  const catMaster = categories.some((c) => (s.byCategory[c.id]?.skillsDone ?? 0) === c.count && c.count > 0);
  const A = [
    ["First step", "Complete your first resource", s.resourcesDone >= 1, "🌱"], ["Warming up", "Complete 10 resources", s.resourcesDone >= 10, "🔥"],
    ["Century", "Complete 100 resources", s.resourcesDone >= 100, "💯"], ["Skill smith", "Complete 5 skills", s.skillsDone >= 5, "🛠️"],
    ["On a roll", "3-day streak", s.bestStreak >= 3, "⚡"], ["Habit", "7-day streak", s.bestStreak >= 7, "📅"],
    ["Unstoppable", "30-day streak", s.bestStreak >= 30, "🚀"], ["Category master", "Finish every skill in a category", catMaster, "👑"],
    ["Futurist", "Complete 3 emerging skills", emergingDone >= 3, "🔭"], ["Note taker", "Write 3 notes", Object.keys(st.notes).length >= 3, "📝"]
  ] as const;

  const download = () => { const url = URL.createObjectURL(new Blob([actions.exportJson()], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = `skillverse-progress-${dayKey(Date.now())}.json`; a.click(); URL.revokeObjectURL(url); };
  const onImport = async (f: File | undefined) => { if (!f) return; const r = actions.importJson(await f.text()); toast(r.message); if (file.current) file.current.value = ""; };

  return (
    <div className="page"><div className="page-pad">
      <span className="eyebrow">My progress</span><h1 className="display" style={{ margin: "8px 0 24px" }}>{s.resourcesDone === 0 ? "Your journey starts here" : `${Math.round(pct * 100)}% of the universe explored`}</h1>
      <div className="stats">
        <div className="card stat"><span className="eyebrow">Resources</span><b>{s.resourcesDone}</b><span className="muted">of {s.resourcesTotal.toLocaleString()}</span><Bar pct={pct} color="var(--done)" /></div>
        <div className="card stat"><span className="eyebrow">Skills completed</span><b>{s.skillsDone}</b><span className="muted">{s.skillsInProgress} in progress · {skills.length} total</span></div>
        <div className="card stat"><span className="eyebrow">Current streak</span><b style={{ color: s.streak ? "var(--new)" : undefined }}>{s.streak}<span style={{ fontSize: 16 }}> days</span></b><span className="muted">best {s.bestStreak} · {s.activeToday ? "done today" : "none yet today"}</span></div>
        <div className="card stat"><span className="eyebrow">Learning time</span><b>{fmtMinutes(s.minutesDone)}</b><span className="muted">estimated · {week} resources this week</span></div>
      </div>

      <section className="sec"><h2 className="h2">Activity</h2><div className="card" style={{ padding: 18 }}>
        <div className="heat" role="img" aria-label="Activity heatmap, last 26 weeks">{weeks.map((w, i) => <div className="col" key={i}>{w.map((d, j) => <i key={j} data-l={d.n < 0 ? undefined : lvl(d.n)} title={d.n < 0 ? "" : `${d.label}: ${d.n} resources`} style={d.n < 0 ? { visibility: "hidden" } : undefined} />)}</div>)}</div></div></section>

      <section className="sec"><h2 className="h2">Next up</h2><div className="grid">{nextUp.map((k) => { const c = categories.find((x) => x.id === k.category)!; const p = skillProgress(k, st); return (
        <Link key={k.id} to={`/skill/${k.id}`} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}><div className="row"><Dot c={c.color} /><span className="h3 grow">{k.name}</span><Icon n="right" s={14} /></div><span className="muted" style={{ fontSize: 12 }}>{c.name} · {p.done}/{p.total} resources</span><Bar pct={p.pct} color={c.color} /></Link>); })}</div></section>

      <section className="sec"><h2 className="h2">By category</h2><div className="card" style={{ padding: 18, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
        {categories.map((c) => { const b = s.byCategory[c.id]; return (<div key={c.id}><div className="row" style={{ marginBottom: 6 }}><Dot c={c.color} /><span className="grow">{c.name}</span><span className="mono muted" style={{ fontSize: 11 }}>{b?.done ?? 0}/{b?.total ?? 0}</span></div><Bar pct={b && b.total ? b.done / b.total : 0} color={c.color} /></div>); })}</div></section>

      <section className="sec"><h2 className="h2">Achievements <span className="muted" style={{ fontSize: 14 }}>{A.filter((a) => a[2]).length}/{A.length}</span></h2>
        <div className="achv">{A.map(([n, d, on, g]) => <div key={n} className={`a ${on ? "on" : ""}`}><span className="g">{g}</span><div><div style={{ fontWeight: 600 }}>{n}</div><div className="muted" style={{ fontSize: 12 }}>{d}</div></div></div>)}</div></section>

      <section className="sec"><h2 className="h2">Your data</h2><p className="sub" style={{ margin: 0, maxWidth: 640 }}>Progress is stored only in this browser. Export a backup to move it between devices or keep it safe.</p>
        <div className="row wrap"><button className="btn secondary" onClick={download}>Export progress</button><button className="btn secondary" onClick={() => file.current?.click()}>Import progress</button><input ref={file} type="file" accept="application/json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
          <button className="btn ghost" onClick={() => { if (window.confirm("Erase all progress, notes and follows from this browser?")) { actions.reset(); toast("Progress reset"); } }}>Reset everything</button></div></section>
    </div></div>
  );
}
