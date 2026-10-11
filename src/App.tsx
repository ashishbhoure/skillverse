import { useEffect, useState } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { BottomTabs, Nav } from "./components/Nav";
import { CommandPalette } from "./components/CommandPalette";
import { useToast } from "./components/ui";
import Universe from "./pages/Universe";
import Roadmap from "./pages/Roadmap";
import Paths, { PathDetail } from "./pages/Paths";
import SkillPage from "./pages/SkillPage";
import Upcoming from "./pages/Upcoming";
import Progress from "./pages/Progress";
import { Community, ListView, NotFound } from "./pages/Misc";

function Shell() {
  const [pal, setPal] = useState(false); const toast = useToast(); const loc = useLocation();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; const typing = /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPal((o) => !o); }
      else if (e.key === "/" && !typing) { e.preventDefault(); setPal(true); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { document.title = "Skillverse · Web Skills 2.0"; }, [loc.pathname]);
  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <Nav onSearch={() => setPal(true)} />
      <div className="main" id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Universe />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/paths" element={<Paths />} />
          <Route path="/paths/:id" element={<PathDetail />} />
          <Route path="/skill/:cat/:slug" element={<SkillPage />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/community" element={<Community />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <BottomTabs />
      <CommandPalette open={pal} onClose={() => setPal(false)} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
export default function App() { return <HashRouter><Shell /></HashRouter>; }
