import { useSyncExternalStore } from "react";
import { resourceIndex, skillResources, skills } from "./data";
import type { Skill, Status } from "./types";

/** Local-first progress store. Everything lives in localStorage; no account needed. */
export interface State {
  done: Record<string, number>; // resourceId -> completed at (ms)
  notes: Record<string, string>; // skillId -> note
  follows: string[]; // followed emerging skill ids
  bookmarks: string[]; // saved skill ids
}
const KEY = "skillverse:v1";
const empty = (): State => ({ done: {}, notes: {}, follows: [], bookmarks: [] });

function load(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && typeof s === "object") return { ...empty(), ...s };
  } catch { /* ignore */ }
  return empty();
}
let state: State = load();
const listeners = new Set<() => void>();
function commit(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useStore = () => useSyncExternalStore(subscribe, () => state);
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => { if (e.key === KEY) { state = load(); listeners.forEach((l) => l()); } });
}

export const actions = {
  toggleResource(id: string) {
    const done = { ...state.done };
    if (done[id]) delete done[id]; else done[id] = Date.now();
    commit({ ...state, done });
  },
  setSkillDone(skill: Skill, value: boolean) {
    const done = { ...state.done }; const now = Date.now();
    for (const r of skillResources(skill)) { if (value) { done[r.id] ||= now; } else delete done[r.id]; }
    commit({ ...state, done });
  },
  setNote(skillId: string, text: string) {
    const notes = { ...state.notes };
    if (text.trim()) notes[skillId] = text; else delete notes[skillId];
    commit({ ...state, notes });
  },
  toggleFollow(id: string) { commit({ ...state, follows: state.follows.includes(id) ? state.follows.filter((x) => x !== id) : [...state.follows, id] }); },
  toggleBookmark(id: string) { commit({ ...state, bookmarks: state.bookmarks.includes(id) ? state.bookmarks.filter((x) => x !== id) : [...state.bookmarks, id] }); },
  exportJson: () => JSON.stringify({ app: "skillverse", version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2),
  importJson(text: string): { ok: boolean; message: string } {
    try {
      const p = JSON.parse(text);
      if (!p || typeof p !== "object" || typeof p.done !== "object" || !p.done) return { ok: false, message: "That file does not look like a Skillverse export." };
      const done: Record<string, number> = {};
      for (const [k, v] of Object.entries(p.done as Record<string, unknown>)) if (resourceIndex[k] && typeof v === "number") done[k] = v;
      commit({ done, notes: typeof p.notes === "object" && p.notes ? p.notes : {}, follows: Array.isArray(p.follows) ? p.follows : [], bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks : [] });
      return { ok: true, message: `Imported ${Object.keys(done).length} completed resources.` };
    } catch { return { ok: false, message: "Could not read that file." }; }
  },
  reset() { commit(empty()); }
};

export interface Progress { done: number; total: number; pct: number; status: Status; lastAt: number }
export function skillProgress(s: Skill, st: State = state): Progress {
  const rs = skillResources(s); let done = 0, lastAt = 0;
  for (const r of rs) { const t = st.done[r.id]; if (t) { done++; lastAt = Math.max(lastAt, t); } }
  const total = rs.length;
  return { done, total, pct: total ? done / total : 0, status: done === 0 ? "none" : done === total ? "done" : "progress", lastAt };
}

export interface Summary {
  resourcesDone: number; resourcesTotal: number; skillsDone: number; skillsInProgress: number; minutesDone: number;
  streak: number; bestStreak: number; activeToday: boolean; perDay: Record<string, number>;
  byCategory: Record<string, { done: number; total: number; skillsDone: number }>; lastSkill: Skill | null;
}
export const dayKey = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export function summarize(st: State): Summary {
  const byCategory: Summary["byCategory"] = {}; const perDay: Record<string, number> = {};
  let skillsDone = 0, skillsInProgress = 0, minutesDone = 0, lastSkill: Skill | null = null, lastT = 0;
  for (const s of skills) {
    const p = skillProgress(s, st);
    const c = (byCategory[s.category] ||= { done: 0, total: 0, skillsDone: 0 });
    c.done += p.done; c.total += p.total;
    if (p.status === "done") { skillsDone++; c.skillsDone++; } else if (p.status === "progress") skillsInProgress++;
    if (p.lastAt && p.status !== "done" && p.lastAt > lastT) { lastT = p.lastAt; lastSkill = s; }
  }
  for (const [id, t] of Object.entries(st.done)) {
    const ref = resourceIndex[id]; if (!ref) continue;
    minutesDone += ref.resource.minutes; const k = dayKey(t); perDay[k] = (perDay[k] || 0) + 1;
  }
  const days = Object.keys(perDay).sort();
  let streak = 0, best = 0, run = 0, prev = 0;
  for (const d of days) { const t = new Date(d + "T00:00:00").getTime(); run = prev && Math.round((t - prev) / 86400000) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = t; }
  const today = dayKey(Date.now()), yesterday = dayKey(Date.now() - 86400000);
  if (perDay[today] || perDay[yesterday]) { let t = perDay[today] ? Date.now() : Date.now() - 86400000; while (perDay[dayKey(t)]) { streak++; t -= 86400000; } }
  return {
    resourcesDone: Object.keys(st.done).filter((k) => resourceIndex[k]).length, resourcesTotal: Object.keys(resourceIndex).length,
    skillsDone, skillsInProgress, minutesDone, streak, bestStreak: best, activeToday: !!perDay[today], perDay, byCategory, lastSkill
  };
}
export const useSummary = () => { const st = useStore(); return summarize(st); };
