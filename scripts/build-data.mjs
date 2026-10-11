// Builds src/data/skills.generated.json from the original blueprint + Skillverse 2.0 additions.
import { writeFileSync, mkdirSync } from "node:fs";
import { parseBlueprint, slug, hash } from "./parse-blueprint.mjs";
import { CATEGORIES, LINKS, SPLIT, EXPERIMENTAL_ORIGINAL, QUADRANTS, EMERGING, PATHS } from "./taxonomy.mjs";

const LEVELS = ["beginner", "intermediate", "advanced"];
const domainOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const kindOf = (u, title) => {
  const d = domainOf(u);
  if (/youtube|youtu\.be|vimeo|egghead|frontendmasters|udemy|pluralsight|twitch/.test(d)) return "video";
  if (/codecademy|freecodecamp|coursera|khanacademy|edx|scrimba|udacity|learn|academy|course/.test(d + " " + title.toLowerCase())) return "course";
  if (/github\.com/.test(d)) return "repo";
  if (/developer\.mozilla|w3\.org|whatwg|ecma|docs\.|\.dev\/docs|spec|reference|nodejs\.org|devdocs/.test(u)) return "docs";
  return "article";
};
const MIN = { video: 45, course: 120, docs: 30, article: 20, repo: 40 };

const catIndex = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const parsed = parseBlueprint("data/blueprint.md");

const skills = [];
const make = (cat, name, base) => {
  const id = `${cat}/${slug(name)}`;
  const sections = base.sections.map((s, si) => ({
    title: s.title,
    description: s.description || "",
    resources: s.resources.filter((r, i, arr) => arr.findIndex((x) => x.url === r.url) === i && !base.sections.slice(0, si).some((o) => o.resources.some((x) => x.url === r.url))).map((r, i) => {
      const kind = kindOf(r.url, r.title);
      return { id: hash(r.url + "|" + id), title: r.title, url: r.url, domain: domainOf(r.url), kind, minutes: MIN[kind] };
    })
  })).filter((s) => s.resources.length || s.title);
  const minutes = sections.reduce((n, s) => n + s.resources.reduce((a, r) => a + r.minutes, 0), 0);
  return { id, name, category: cat, group: base.group ?? null, description: base.description || "", level: base.level, experimental: !!base.experimental, emerging: base.emerging ?? null, minutes, sections };
};

// original skills (redistributed per SPLIT rules)
const byCat = {};
for (const p of parsed) {
  let cat = p.category;
  const rule = SPLIT[cat];
  if (rule) { const hit = Object.entries(rule).find(([k, v]) => k !== "__default" && v.includes(p.name)); cat = hit ? hit[0] : rule.__default; }
  (byCat[cat] ||= []).push({ ...p, category: cat });
}
for (const [cat, list] of Object.entries(byCat)) {
  list.forEach((p, i) => {
    const base = catIndex[cat].level; let li = LEVELS.indexOf(base);
    if (list.length >= 8) { if (i < list.length * 0.35) li -= 1; else if (i >= list.length * 0.75) li += 1; }
    li = Math.max(0, Math.min(2, li));
    skills.push(make(cat, p.name, { ...p, level: LEVELS[li], experimental: EXPERIMENTAL_ORIGINAL.includes(p.name) }));
  });
}
// emerging skills
for (const e of EMERGING) {
  skills.push(make(e.category, e.name, {
    description: e.description, level: e.level, experimental: e.experimental,
    emerging: { ring: e.ring, quadrant: e.q },
    sections: [{ title: "", description: "", resources: e.resources.map(([title, url]) => ({ title, url })) }]
  }));
}
// order: keep category order, original skills first then emerging
const order = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));
skills.sort((a, b) => order[a.category] - order[b.category]);
const seen = new Set();
for (const s of skills) { if (seen.has(s.id)) throw new Error("duplicate id " + s.id); seen.add(s.id); }

// resolve paths
const byId = Object.fromEntries(skills.map((s) => [s.id, s]));
const byCatName = Object.fromEntries(skills.map((s) => [s.category + ":" + s.name, s]));
const unresolved = [];
const paths = PATHS.map((p) => ({
  id: p.id, name: p.name, color: p.color, blurb: p.blurb,
  skills: p.skills.map((k) => { const s = k.includes(":") ? byCatName[k] : byId[k]; if (!s) { unresolved.push(p.id + " -> " + k); return null; } return s.id; }).filter(Boolean)
}));
if (unresolved.length) { console.error("UNRESOLVED path entries:\n" + unresolved.join("\n")); process.exit(1); }

const categories = CATEGORIES.map((c) => ({ ...c, count: skills.filter((s) => s.category === c.id).length }));
const totalResources = skills.reduce((n, s) => n + s.sections.reduce((a, x) => a + x.resources.length, 0), 0);
const out = { categories, skills, links: LINKS, paths, quadrants: QUADRANTS, stats: { skills: skills.length, resources: totalResources, emerging: skills.filter((s) => s.emerging).length }, generatedFrom: "andreasbm/web-skills (MIT) + Skillverse additions" };
mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/skills.generated.json", JSON.stringify(out));
console.log(`skills=${out.stats.skills} resources=${totalResources} emerging=${out.stats.emerging} categories=${categories.length}`);
categories.forEach((c) => { if (!c.count) console.warn("EMPTY category", c.id); });
