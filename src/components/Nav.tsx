import { NavLink, useLocation } from "react-router-dom";
import { useSummary } from "../lib/store";
import { CoffeeButton, Icon } from "./ui";

const TABS = [
  { to: "/", label: "Universe", end: true, icon: "universe" },
  { to: "/roadmap", label: "Roadmap", icon: "map" },
  { to: "/paths", label: "Paths", icon: "route" },
  { to: "/upcoming", label: "Upcoming", icon: "radar" },
  { to: "/progress", label: "My Progress", icon: "chart" },
  { to: "/community", label: "Community", icon: "users", opt: true }
];

export function Nav({ onSearch }: { onSearch: () => void }) {
  const s = useSummary(); const loc = useLocation();
  const isUni = loc.pathname === "/";
  return (
    <header className="nav">
      {isUni && <button className="icon-btn" aria-label="Toggle categories" onClick={() => window.dispatchEvent(new Event("skillverse:toggle-side"))}><Icon n="menu" /></button>}
      <NavLink to="/" className="logo" aria-label="Skillverse home"><span className="logo-glyph" />Skillverse</NavLink>
      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab${isActive ? " active" : ""}${t.opt ? " opt" : ""}`}>{t.label}</NavLink>)}
      </nav>
      <div className="nav-spacer" />
      <button className="search-btn" onClick={onSearch} aria-label="Search skills and resources" aria-keyshortcuts="Control+K Meta+K">
        <Icon n="search" s={16} /><span>Search skills, resources, topics…</span><span className="kbd" style={{ flex: "none" }}>Ctrl K</span>
      </button>
      <CoffeeButton />
      <div className={`streak ${s.streak ? "" : "off"}`} title="Consecutive days with at least one completed resource"><Icon n="flame" s={14} fill /><span className="t">{s.streak ? `${s.streak}-day streak` : "Start a streak"}</span><span className="num mono">{s.streak}</span></div>
      <div className="avatar" aria-hidden="true">{Math.round((s.resourcesDone / s.resourcesTotal) * 100)}%</div>
    </header>
  );
}

export function BottomTabs() {
  return (
    <nav className="bottom-tabs" aria-label="Primary">
      {TABS.filter((t) => t.to !== "/community").map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? "active" : "")}><Icon n={t.icon} s={20} />{t.label.replace("My ", "")}</NavLink>
      ))}
    </nav>
  );
}
