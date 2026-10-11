export type Level = "beginner" | "intermediate" | "advanced";
export type Ring = "adopt" | "trial" | "assess";
export type Kind = "video" | "course" | "docs" | "article" | "repo";

export interface Resource { id: string; title: string; url: string; domain: string; kind: Kind; minutes: number }
export interface Section { title: string; description: string; resources: Resource[] }
export interface Skill {
  id: string; name: string; category: string; group: string | null; description: string;
  level: Level; experimental: boolean; emerging: { ring: Ring; quadrant: number } | null;
  minutes: number; sections: Section[];
}
export interface Category {
  id: string; name: string; color: string; pos: [number, number]; level: Level; blurb: string;
  emerging?: boolean; count: number;
}
export interface Path { id: string; name: string; color: string; blurb: string; skills: string[] }
export interface Dataset {
  categories: Category[]; skills: Skill[]; links: [string, string][]; paths: Path[];
  quadrants: string[]; stats: { skills: number; resources: number; emerging: number }; generatedFrom: string;
}
export type Status = "none" | "progress" | "done";
