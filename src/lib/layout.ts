import { categories, skillsByCat } from "./data";

/** Deterministic constellation layout: each category is a phyllotaxis spiral around its centre. */
export const WORLD = { w: 3600, h: 2300 };
export interface CatNode { x: number; y: number; r: number }
export const catLayout: Record<string, CatNode> = {};
export const skillLayout: Record<string, { x: number; y: number }> = {};
const GOLDEN = 2.399963229728653;
for (const c of categories) {
  const list = skillsByCat[c.id] ?? []; let r = 60;
  list.forEach((s, i) => {
    const rad = 66 + Math.sqrt(i + 1) * 36; const ang = i * GOLDEN + (c.id.length % 5);
    skillLayout[s.id] = { x: c.pos[0] + Math.cos(ang) * rad, y: c.pos[1] + Math.sin(ang) * rad };
    r = Math.max(r, rad);
  });
  catLayout[c.id] = { x: c.pos[0], y: c.pos[1], r };
}
export const curvePath = (a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.18) => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
  return `M ${a.x} ${a.y} Q ${mx - dy * bend} ${my + dx * bend} ${b.x} ${b.y}`;
};
