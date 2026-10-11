// Parses the original Web Skills blueprint (MIT, Andreas Mehlsen) into structured skills.
import { readFileSync } from "node:fs";

const COLLECTION_MAP = {
  "Accessibility": "accessibility",
  "Web Components": "web-components",
  "Progressive Webapps": "pwa",
  "Build tools": "build-tools",
  "Frameworks & Libraries": "frameworks",
  "Testing": "testing",
  "Architecture & paradigms": "architecture",
  "Team Collaboration": "team",
  "Design & UX": "design",
  "The Modern Web": "modern-web",
  "Algorithms & Data structures": "algorithms",
  "Databases & Servers": "databases"
};
const FUNDAMENTALS = { "HTML": "html", "CSS": "css", "Javascript": "javascript", "The Browser": "browser" };

export const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

const RES = /^\*\s*\[[ xX]\]\s*\[(?:<img[^>]*>\s*)?(.*?)\]\((\S+?)\)\s*$/;

export function parseBlueprint(path) {
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const skills = [];
  let collection = null, category = null, group = null;
  let skill = null, section = null, startedFaq = true;

  const flush = () => { skill = null; section = null; };
  const startSkill = (name) => {
    skill = { name, category, group, description: "", sections: [{ title: "", description: "", resources: [] }] };
    section = skill.sections[0];
    skills.push(skill);
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if ((m = /^##\s+(.*)$/.exec(line))) {
      flush(); collection = m[1].trim(); group = null;
      startedFaq = collection === "FAQ";
      category = COLLECTION_MAP[collection] ?? null;
      continue;
    }
    if (startedFaq || (!category && collection !== "Fundamentals")) continue;
    if ((m = /^###\s+(.*)$/.exec(line))) {
      const title = m[1].trim();
      flush();
      if (collection === "Fundamentals" && FUNDAMENTALS[title]) { category = FUNDAMENTALS[title]; group = null; continue; }
      startSkill(title);
      continue;
    }
    if ((m = /^#{4,5}\s+(.*)$/.exec(line))) {
      if (!skill) continue;
      section = { title: m[1].trim(), description: "", resources: [] };
      skill.sections.push(section);
      continue;
    }
    if (!skill) continue;
    if ((m = RES.exec(line))) {
      let url = m[2];
      let title = m[1].replace(/<[^>]+>/g, "").trim();
      section.resources.push({ title, url });
      continue;
    }
    if (line.trim() && !line.startsWith("*") && !line.startsWith("<") && !line.startsWith("-")) {
      const text = line.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
      if (!section.description) section.description = text;
      else if (section === skill.sections[0] && !skill.description) skill.description = text;
    }
  }

  // group headers: skills with no resources anywhere become `group` labels for following skills
  const out = [];
  const groupByCat = {};
  for (const s of skills) {
    const total = s.sections.reduce((n, x) => n + x.resources.length, 0);
    if (total === 0) { groupByCat[s.category] = s.name; continue; }
    s.group = groupByCat[s.category] ?? null;
    const first = s.sections[0];
    s.description = first.description || s.sections.find((x) => x.description)?.description || "";
    out.push(s);
  }
  return out;
}

if (process.argv[1].endsWith("parse-blueprint.mjs")) {
  const sk = parseBlueprint("data/blueprint.md");
  const by = {};
  for (const s of sk) (by[s.category] ||= []).push(s.name + " (" + s.sections.reduce((n, x) => n + x.resources.length, 0) + ")");
  for (const [c, v] of Object.entries(by)) console.log(c + " [" + v.length + "]: " + v.join(" | "));
  console.log("TOTAL skills", sk.length, "resources", sk.reduce((n, s) => n + s.sections.reduce((a, x) => a + x.resources.length, 0), 0));
}
