// Regenerates README screenshots: node scripts/screenshots.mjs [baseUrl]
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:5173/";
const OUT = "docs/screenshots"; mkdirSync(OUT, { recursive: true });
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
const b = await chromium.launch({ executablePath: exe });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

// seed some progress through the real UI
for (const s of ["html/syntax", "html/forms", "html/seo", "css/syntax", "css/selectors", "css/box-model", "javascript/syntax", "javascript/dom", "javascript/events", "browser/http"]) {
  await p.goto(BASE + "#/skill/" + s); await p.waitForSelector(".res-row");
  await p.getByRole("button", { name: "Mark skill complete" }).click();
}
await p.goto(BASE + "#/skill/css/layout"); await p.waitForSelector(".res-row");
await p.locator(".res-row .check").nth(0).click(); await p.locator(".res-row .check").nth(1).click();
await p.goto(BASE + "#/skill/javascript/promises"); await p.waitForSelector(".res-row"); await p.locator(".res-row .check").nth(0).click();

const shot = async (name, hash, wait, opts = {}) => { await p.goto(BASE + "#" + hash); await p.waitForSelector(wait); await p.waitForTimeout(opts.delay ?? 900); await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: !!opts.full }); };
await shot("universe", "/", ".cluster", { delay: 3200 });
await shot("universe-path", "/?focus=css&path=frontend", ".cluster", { delay: 1800 });
await shot("roadmap", "/roadmap?path=frontend", ".rm-col");
await shot("skill", "/skill/css/layout", ".res-row");
await shot("upcoming", "/upcoming", ".radar");
await shot("progress", "/progress", ".stat");
await shot("paths", "/paths", ".path-card");
await p.goto(BASE + "#/"); await p.waitForSelector(".cluster"); await p.keyboard.press("Control+k"); await p.waitForSelector(".palette input"); await p.locator(".palette input").fill("worker"); await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/search.png` });

const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const mp = await m.newPage(); await mp.goto(BASE + "#/"); await mp.waitForSelector(".cluster"); await mp.waitForTimeout(900);
await mp.screenshot({ path: `${OUT}/mobile.png` });
await b.close(); console.log("screenshots written to " + OUT);
