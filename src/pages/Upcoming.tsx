import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { catById, DATA, LEVEL_LABEL, skills } from "../lib/data";
import { actions, useStore } from "../lib/store";
import type { Ring, Skill } from "../lib/types";
import { Dot, Icon, toast } from "../components/ui";

const QCOL = ["#FF5CF4", "#FFB547", "#7DD3FC", "#49CB5C"];
const RINGS: { id: Ring; label: string; r0: number; r1: number; blurb: string }[] = [
  { id: "adopt", label: "Adopt", r0: 26, r1: 112, blurb: "Stable and widely used. Learn these now." },
  { id: "trial", label: "Trial", r0: 112, r1: 202, blurb: "Proven in production by early adopters. Worth a side project." },
  { id: "assess", label: "Assess", r0: 202, r1: 288, blurb: "Promising or experimental. Keep an eye on them." }
];
const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

export default function Upcoming() {
  const st = useStore(); const nav = useNavigate();
  const [q, setQ] = useState<number | null>(null); const [hov, setHov] = useState<Skill | null>(null);
  const emerging = useMemo(() => skills.filter((s) => s.emerging), []);
  const shown = emerging.filter((s) => q === null || s.emerging!.quadrant === q);

  const dots = useMemo(() => {
    const groups: Record<string, Skill[]> = {}; for (const s of emerging) (groups[s.emerging!.ring + s.emerging!.quadrant] ||= []).push(s);
    return emerging.map((s) => {
      const g = groups[s.emerging!.ring + s.emerging!.quadrant]; const i = g.indexOf(s); const ring = RINGS.find((r) => r.id === s.emerging!.ring)!;
      const a0 = s.emerging!.quadrant * 90 - 90, ang = ((a0 + ((i + 1) / (g.length + 1)) * 90) * Math.PI) / 180;
      const rad = ring.r0 + (0.25 + ((hash(s.id) % 100) / 100) * 0.5) * (ring.r1 - ring.r0);
      return { s, x: 300 + Math.cos(ang) * rad, y: 300 + Math.sin(ang) * rad };
    });
  }, [emerging]);

  return (
    <div className="page"><div className="page-pad">
      <span className="eyebrow">Skill radar · {emerging.length} emerging skills</span>
      <h1 className="display" style={{ margin: "8px 0 10px" }}>What to learn next</h1>
      <p className="lead">The platform keeps moving. This radar tracks the skills that are new or rising, from AI engineering to WebGPU, so your map never goes stale. Ratings are editorial and reflect the state of the ecosystem at publication.</p>

      <div className="row wrap" style={{ margin: "22px 0" }} role="group" aria-label="Filter by quadrant">
        <button className={`chip ${q === null ? "active" : ""}`} onClick={() => setQ(null)}>All themes</button>
        {DATA.quadrants.map((n, i) => <button key={n} className={`chip ${q === i ? "active" : ""}`} onClick={() => setQ(q === i ? null : i)}><Dot c={QCOL[i]} />{n}</button>)}
      </div>

      <div className="up-grid">
        <div style={{ position: "relative" }}>
          <svg className="radar" viewBox="0 0 600 600" role="img" aria-label="Technology radar of emerging web skills">
            {RINGS.slice().reverse().map((r) => <circle key={r.id} cx={300} cy={300} r={r.r1} fill="var(--bg-surface)" fillOpacity={0.6} stroke="var(--border-strong)" strokeDasharray="4 6" />)}
            <line x1={300} y1={8} x2={300} y2={592} stroke="var(--border-strong)" /><line x1={8} y1={300} x2={592} y2={300} stroke="var(--border-strong)" />
            {RINGS.map((r) => <text key={r.id} x={306} y={300 - (r.r0 + r.r1) / 2 + 4} fontSize={11} fill="var(--text-3)" className="mono" style={{ letterSpacing: "0.08em" }}>{r.label.toUpperCase()}</text>)}
            {DATA.quadrants.map((n, i) => <text key={n} x={i === 0 || i === 1 ? 590 : 10} y={i === 0 || i === 3 ? 22 : 586} textAnchor={i === 0 || i === 1 ? "end" : "start"} fontSize={12} fontWeight={600} fill={QCOL[i]}>{n}</text>)}
            {dots.map(({ s, x, y }) => { const on = q === null || s.emerging!.quadrant === q; return (
              <g key={s.id} opacity={on ? 1 : 0.12} onMouseEnter={() => setHov(s)} onMouseLeave={() => setHov(null)}>
                <circle className="dotp" cx={x} cy={y} r={hov?.id === s.id ? 11 : 8} fill={QCOL[s.emerging!.quadrant]} stroke={s.experimental ? "#fff" : "none"} strokeDasharray={s.experimental ? "2 2" : undefined} tabIndex={on ? 0 : -1} role="link" aria-label={`${s.name}, ${s.emerging!.ring}`} onClick={() => nav(`/skill/${s.id}`)} onKeyDown={(e) => { if (e.key === "Enter") nav(`/skill/${s.id}`); }} onFocus={() => setHov(s)} onBlur={() => setHov(null)} />
              </g>); })}
          </svg>
          <div className="card" style={{ padding: 14, minHeight: 78, marginTop: 8 }} aria-live="polite">
            {hov ? <><div className="row"><Dot c={QCOL[hov.emerging!.quadrant]} /><b>{hov.name}</b><span className="ring-tag" style={{ ["--c" as string]: QCOL[hov.emerging!.quadrant] }}>{hov.emerging!.ring}</span></div><div className="sub" style={{ fontSize: 12, marginTop: 4 }}>{hov.description}</div></>
              : <div className="muted" style={{ fontSize: 12 }}>Hover or focus a dot. Dashed white outline = experimental. Click to open the skill.</div>}
          </div>
        </div>

        <div className="sec" style={{ marginTop: 0 }}>
          {RINGS.map((r) => { const list = shown.filter((s) => s.emerging!.ring === r.id); if (!list.length) return null; return (
            <section key={r.id} aria-label={r.label}>
              <div className="row" style={{ marginBottom: 10 }}><h2 className="h2">{r.label}</h2><span className="muted" style={{ fontSize: 12 }}>{r.blurb}</span></div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
                {list.map((s) => { const f = st.follows.includes(s.id); return (
                  <article key={s.id} className="card emerge">
                    <div className="row"><Dot c={QCOL[s.emerging!.quadrant]} /><Link to={`/skill/${s.id}`} className="h3 grow">{s.name}</Link>{s.experimental && <span className="badge exp">Exp.</span>}</div>
                    <div className="sub" style={{ fontSize: 12, lineHeight: "16px" }}>{s.description}</div>
                    <div className="row wrap" style={{ fontSize: 11 }}><span className="pill">{LEVEL_LABEL[s.level]}</span><span className="pill">{catById[s.category].name}</span></div>
                    <div className="row"><button className={`btn sm ${f ? "on" : "secondary"}`} aria-pressed={f} onClick={() => { actions.toggleFollow(s.id); toast(f ? `Unfollowed ${s.name}` : `Following ${s.name}`); }}>{f ? <><Icon n="check" s={13} /> Following</> : <><Icon n="plus" s={13} /> Follow</>}</button><Link className="btn ghost sm" to={`/skill/${s.id}`}>Open <Icon n="right" s={13} /></Link></div>
                  </article>); })}
              </div>
            </section>); })}
        </div>
      </div>
    </div></div>
  );
}
