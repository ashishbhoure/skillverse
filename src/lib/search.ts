import { allResources, categories, skills } from "./data";

export interface Hit { type: "page" | "category" | "skill" | "resource"; id: string; title: string; sub: string; to?: string; url?: string; color?: string; score: number }
export const PAGES = [
  { id: "universe", title: "Skill Universe", to: "/", keywords: "home map constellation graph" },
  { id: "roadmap", title: "Roadmap view", to: "/roadmap", keywords: "columns horizontal map" },
  { id: "paths", title: "Role paths", to: "/paths", keywords: "learning paths frontend backend ai roadmap career" },
  { id: "upcoming", title: "Upcoming skills radar", to: "/upcoming", keywords: "emerging new trends radar future" },
  { id: "progress", title: "My progress", to: "/progress", keywords: "dashboard streak stats achievements" },
  { id: "list", title: "List view", to: "/list", keywords: "accessible table all skills" },
  { id: "community", title: "Community and contribute", to: "/community", keywords: "suggest contribute about credits" }
];

function score(q: string[], hay: string, title: string): number {
  let s = 0; const h = hay.toLowerCase(), t = title.toLowerCase();
  for (const w of q) {
    // word-prefix matching: "rag" finds "RAG" but not "Storage"
    if (!new RegExp("(^|[^a-z0-9])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(h)) return 0;
    s += 1; if (t === w) s += 6; else if (t.startsWith(w)) s += 4; else if (t.includes(" " + w)) s += 3; else if (t.includes(w)) s += 2;
  }
  return s;
}

export function search(query: string, limit = 24): Hit[] {
  const q = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!q.length) return [];
  const hits: Hit[] = [];
  for (const p of PAGES) { const s = score(q, p.title + " " + p.keywords, p.title); if (s) hits.push({ type: "page", id: p.id, title: p.title, sub: "Page", to: p.to, score: s + 0.5 }); }
  for (const c of categories) { const s = score(q, c.name + " " + c.blurb, c.name); if (s) hits.push({ type: "category", id: c.id, title: c.name, sub: `Category · ${c.count} skills`, to: `/?focus=${c.id}`, color: c.color, score: s + 1 }); }
  for (const k of skills) { const s = score(q, k.name + " " + k.description + " " + k.category, k.name); if (s) hits.push({ type: "skill", id: k.id, title: k.name, sub: `Skill · ${k.category}`, to: `/skill/${k.id}`, score: s + 0.8 }); }
  for (const { resource: r, skill } of allResources) { const s = score(q, r.title + " " + r.domain, r.title); if (s) hits.push({ type: "resource", id: r.id, title: r.title, sub: `${r.domain} · ${skill.name}`, url: r.url, score: s }); }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
