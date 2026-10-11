import raw from "../data/skills.generated.json";
import type { Category, Dataset, Resource, Skill } from "./types";

export const DATA = raw as unknown as Dataset;
export const categories: Category[] = DATA.categories;
export const skills: Skill[] = DATA.skills;
export const catById: Record<string, Category> = Object.fromEntries(categories.map((c) => [c.id, c]));
export const skillById: Record<string, Skill> = Object.fromEntries(skills.map((s) => [s.id, s]));
export const skillsByCat: Record<string, Skill[]> = {};
for (const s of skills) (skillsByCat[s.category] ||= []).push(s);

export interface ResourceRef { resource: Resource; skill: Skill }
export const resourceIndex: Record<string, ResourceRef> = {};
export const allResources: ResourceRef[] = [];
for (const s of skills) for (const sec of s.sections) for (const r of sec.resources) {
  const ref = { resource: r, skill: s };
  resourceIndex[r.id] = ref; allResources.push(ref);
}
export const skillResources = (s: Skill): Resource[] => s.sections.flatMap((x) => x.resources);

/** Previous / next skill in the same category: the default prerequisite chain. */
export function neighbours(s: Skill) {
  const list = skillsByCat[s.category];
  const i = list.findIndex((x) => x.id === s.id);
  return { prev: list.slice(Math.max(0, i - 3), i), next: list.slice(i + 1, i + 4), index: i, total: list.length };
}
export const LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;
export const fmtMinutes = (m: number) => (m < 60 ? `${m}m` : `${Math.round((m / 60) * 10) / 10}h`);
export const pathById = (id: string) => DATA.paths.find((p) => p.id === id);
