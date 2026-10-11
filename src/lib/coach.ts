import { fmtMinutes, neighbours, skillResources } from "./data";
import { skillProgress, type State } from "./store";
import type { Skill } from "./types";

/**
 * Offline "coach": deterministic, rule-based answers built from the skill's own data.
 * No language model is involved. Set VITE_COACH_ENDPOINT to POST questions to your own LLM backend instead:
 * request  { skill: {id, name, description}, question, completed }  ->  response { answer: string }
 */
export const COACH_SUGGESTIONS = ["What should I do next?", "Build me a 30 minute plan", "Quiz me", "What should I know first?"];

export async function ask(skill: Skill, question: string, st: State): Promise<string> {
  const endpoint = import.meta.env.VITE_COACH_ENDPOINT as string | undefined;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: { id: skill.id, name: skill.name, description: skill.description }, question, completed: skillProgress(skill, st).done })
      });
      if (res.ok) { const j = await res.json(); if (typeof j.answer === "string") return j.answer; }
    } catch { /* fall through to the local answer */ }
  }
  return localAnswer(skill, question, st);
}

function localAnswer(skill: Skill, question: string, st: State): string {
  const q = question.toLowerCase();
  const all = skillResources(skill); const todo = all.filter((r) => !st.done[r.id]);
  const p = skillProgress(skill, st);
  if (/quiz|test me|question/.test(q)) {
    const topics = skill.sections.filter((s) => s.title).map((s) => s.title);
    const base = topics.length ? topics : [skill.name];
    const qs = base.slice(0, 4).map((t, i) => `${i + 1}. Explain ${t} in your own words, then write a tiny example.`);
    qs.push(`${qs.length + 1}. When would you NOT use ${skill.name}?`);
    return `Self-check for ${skill.name}:\n${qs.join("\n")}\nAnswer in your notes tab, then compare with the resources.`;
  }
  const m = /(\d+)\s*(min|minute|hour|h)/.exec(q) || (/plan/.test(q) ? ["", "30", "min"] : null);
  if (m) {
    let budget = parseInt(m[1], 10) * (/h/.test(m[2]) ? 60 : 1); const plan: string[] = [];
    for (const r of [...todo].sort((a, b) => a.minutes - b.minutes)) { if (r.minutes <= budget) { plan.push(`• ${r.title} (${r.minutes}m)`); budget -= r.minutes; } }
    if (plan.length) return `Here is a plan that fits your time:\n${plan.join("\n")}\nDurations are rough estimates by resource type.`;
    return todo.length ? `The shortest remaining resource is longer than that. Try "${todo[0].title}" when you have ${todo[0].minutes} minutes.` : "You have finished every resource here. Mark the skill complete and move on!";
  }
  if (/first|before|prereq|know|start/.test(q)) {
    const { prev } = neighbours(skill);
    return prev.length ? `Before ${skill.name}, you should be comfortable with:\n${prev.map((s) => `• ${s.name} (${Math.round(skillProgress(s, st).pct * 100)}% done)`).join("\n")}` : `${skill.name} is the first stop in this category, so you can start right away.`;
  }
  if (/next|continue|what now|resume/.test(q) || !q.trim()) {
    if (!todo.length) { const n = neighbours(skill).next[0]; return `You have completed every resource for ${skill.name}.${n ? ` Next up: ${n.name}.` : ""}`; }
    return `${p.done ? `You have done ${p.done} of ${p.total}. ` : ""}Next: "${todo[0].title}" from ${todo[0].domain} (about ${todo[0].minutes} minutes). Roughly ${fmtMinutes(todo.reduce((n, r) => n + r.minutes, 0))} remain in total.`;
  }
  return `${skill.description || skill.name}\n\nTry asking: "What should I do next?", "Build me a 45 minute plan" or "Quiz me".`;
}
