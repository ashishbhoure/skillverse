import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { search, PAGES, type Hit } from "../lib/search";
import { Icon } from "./ui";

const TYPE_LABEL = { page: "Page", category: "Category", skill: "Skill", resource: "Link" } as const;

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState(""); const [sel, setSel] = useState(0);
  const nav = useNavigate(); const input = useRef<HTMLInputElement>(null); const list = useRef<HTMLDivElement>(null);
  const hits: Hit[] = useMemo(() => (q.trim() ? search(q) : PAGES.map((p) => ({ type: "page" as const, id: p.id, title: p.title, sub: "Jump to", to: p.to, score: 0 }))), [q]);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => input.current?.focus(), 10); } }, [open]);
  useEffect(() => setSel(0), [q]);
  useEffect(() => { list.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" }); }, [sel]);
  if (!open) return null;
  const go = (h: Hit | undefined) => {
    if (!h) return;
    if (h.url) window.open(h.url, "_blank", "noopener,noreferrer"); else if (h.to) nav(h.to);
    onClose();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((i) => Math.min(hits.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); go(hits[sel]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };
  return (
    <div className="pal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" onKeyDown={onKey}>
        <div className="pal-input"><Icon n="search" /><input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 237 skills and 1,500+ resources…" aria-label="Search query" role="combobox" aria-expanded="true" aria-controls="pal-list" /><span className="kbd">Esc</span></div>
        <div className="pal-list" id="pal-list" role="listbox" ref={list}>
          {hits.length === 0 && <div className="muted" style={{ padding: 24, textAlign: "center" }}>No results for "{q}". Try a technology or topic, e.g. "grid", "rag", "service worker".</div>}
          {hits.map((h, i) => (
            <button key={h.type + h.id} data-i={i} role="option" aria-selected={i === sel} className={`pal-item ${i === sel ? "sel" : ""}`} onMouseMove={() => setSel(i)} onClick={() => go(h)}>
              <span className="pal-type">{TYPE_LABEL[h.type]}</span>
              {h.color && <span className="dot" style={{ ["--c" as string]: h.color }} />}
              <span className="grow"><div className="tt">{h.title}</div><div className="ss">{h.sub}</div></span>
              {h.url && <Icon n="ext" s={14} />}
            </button>
          ))}
        </div>
        <div className="pal-foot"><span>↑↓ navigate</span><span>↵ open</span><span>Esc close</span></div>
      </div>
    </div>
  );
}
