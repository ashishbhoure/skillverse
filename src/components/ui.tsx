import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { catById, fmtMinutes, skillResources } from "../lib/data";
import { skillProgress, useStore } from "../lib/store";
import type { Level, Resource, Skill, Status } from "../lib/types";

const P: Record<string, string> = {
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  x: "M18 6 6 18M6 6l12 12",
  check: "m5 12 5 5 9-10",
  right: "M5 12h14m-6-6 6 6-6 6",
  left: "M19 12H5m6-6-6 6 6 6",
  ext: "M14 4h6v6m0-6L10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  menu: "M4 7h16M4 12h16M4 17h16",
  flame: "M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9Z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  universe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  map: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6",
  radar: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-4 6-6",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H2",
  users: "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m13-11a3 3 0 1 0 0-6M22 20v-1a4 4 0 0 0-3-3.9M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  send: "M12 19V5m-6 6 6-6 6 6",
  spark: "m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
  coffee: "M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8ZM6 2v3M10 2v3M14 2v3"
};
export function Icon({ n, s = 18, fill = false }: { n: string; s?: number; fill?: boolean }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[n]} />
    </svg>
  );
}

export const SUPPORT_URL = "https://buymeacoffee.com/ashishbhoure";
/** Official Buy Me a Coffee artwork. `responsive` swaps the wide button for the cup icon on narrower screens. */
export function CoffeeButton({ height = 40, responsive = false }: { height?: number; responsive?: boolean }) {
  const base = import.meta.env.BASE_URL;
  return (
    <a className="coffee-btn" href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" aria-label="Buy me a coffee" title="Support Skillverse on Buy Me a Coffee">
      <img className="bmc-wide" src={base + "img/bmc-button.png"} alt="Buy me a coffee" height={height} width={Math.round((height * 1090) / 306)} />
      {responsive && <img className="bmc-icon" src={base + "img/bmc-logo.webp"} alt="" aria-hidden="true" width={height} height={height} />}
    </a>
  );
}
export const Dot = ({ c }: { c: string }) => <span className="dot" style={{ ["--c" as string]: c }} />;
export const Bar = ({ pct, color }: { pct: number; color?: string }) => (
  <div className="bar" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
    <i style={{ width: `${Math.max(pct > 0 ? 2 : 0, pct * 100)}%`, ["--c" as string]: color }} />
  </div>
);
export const StatusBadge = ({ status }: { status: Status }) =>
  status === "done" ? <span className="badge done">Completed</span> : status === "progress" ? <span className="badge progress">In progress</span> : null;
export const LevelPill = ({ level }: { level: Level }) => <span className="pill">{level}</span>;

export function SkillCard({ skill, compact }: { skill: Skill; compact?: boolean }) {
  const st = useStore(); const p = skillProgress(skill, st); const c = catById[skill.category];
  const accent = p.status === "done" ? "var(--done)" : p.status === "progress" ? "var(--progress)" : c.color;
  return (
    <Link to={`/skill/${skill.id}`} className={`skill-card ${p.status}`}>
      <div className="t"><Dot c={accent} /> <span>{skill.name}</span>
        {skill.emerging ? <span className="badge new">New</span> : skill.experimental ? <span className="badge exp">Exp.</span> : null}
      </div>
      {!compact && <p>{skill.description || "Curated resources to learn and practise this skill."}</p>}
      <div className="m"><span>{p.total} resources</span><span>~{fmtMinutes(skill.minutes)}</span><span style={{ marginLeft: "auto" }}>{p.done}/{p.total}</span></div>
      <Bar pct={p.pct} color={accent} />
    </Link>
  );
}

export function Favicon({ domain }: { domain: string }) {
  return <span className="fav" aria-hidden="true">{domain.replace(/^(www|docs|developer|developers)\./, "").slice(0, 2)}</span>;
}
export function ResourceRow({ r, done, onToggle }: { r: Resource; done: boolean; onToggle: () => void }) {
  return (
    <div className={`res-row ${done ? "done" : ""}`}>
      <Favicon domain={r.domain} />
      <div className="grow">
        <a className="res-t" href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>{r.title} <Icon n="ext" s={12} /></a>
        <div className="res-s">{r.domain} · {r.kind} · {r.minutes} min</div>
      </div>
      <button className={`check ${done ? "on" : ""}`} onClick={onToggle} role="checkbox" aria-checked={done} aria-label={`Mark "${r.title}" as ${done ? "not done" : "done"}`}>{done && <Icon n="check" s={14} />}</button>
    </div>
  );
}

export const totalResources = (s: Skill) => skillResources(s).length;

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t: number;
    const on = (e: Event) => { setMsg((e as CustomEvent<string>).detail); window.clearTimeout(t); t = window.setTimeout(() => setMsg(null), 2600); };
    window.addEventListener("skillverse:toast", on);
    return () => { window.removeEventListener("skillverse:toast", on); window.clearTimeout(t); };
  }, []);
  return msg;
}
export const toast = (m: string) => window.dispatchEvent(new CustomEvent("skillverse:toast", { detail: m }));
