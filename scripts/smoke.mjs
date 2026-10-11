// Browser smoke test: node scripts/smoke.mjs [baseUrl] [shotDir]
// Requires the app to be served (npm run preview) and a local Chrome/Edge install.
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:4173/";
const OUT = process.argv[3] || "smoke-shots";
mkdirSync(OUT, { recursive: true });
const CANDIDATES = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"];
const executablePath = CANDIDATES.find(existsSync);
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };

const browser = await chromium.launch({ executablePath, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto(BASE + "#/"); await page.waitForSelector(".canvas-wrap svg .cluster");
ok((await page.locator(".cluster").count()) === 26, "universe renders 26 clusters");
ok((await page.locator(".node").count()) === 237, "universe renders 237 skill nodes");

// zoom + pan
const z0 = await page.locator(".zoom span").innerText();
const box = await page.locator(".canvas-wrap").boundingBox();
await page.mouse.move(box.x + 600, box.y + 400); await page.mouse.wheel(0, -600); await page.waitForTimeout(200);
const z1 = await page.locator(".zoom span").innerText();
ok(parseInt(z1) > parseInt(z0), `wheel zoom works (${z0} -> ${z1})`);
const t0 = await page.locator(".canvas-wrap svg > g").getAttribute("transform");
await page.mouse.down(); await page.mouse.move(box.x + 700, box.y + 450, { steps: 5 }); await page.mouse.up();
const t1 = await page.locator(".canvas-wrap svg > g").getAttribute("transform");
ok(t0 !== t1, "drag pans the map");

// cluster focus + sidebar
await page.getByRole("button", { name: /^CSS/ }).first().click(); await page.waitForTimeout(900);
ok(page.url().includes("focus=css"), "sidebar click focuses cluster via URL");
ok(await page.locator(".hover-card.pin").isVisible(), "cluster card shown");
await page.screenshot({ path: `${OUT}/universe-focus.png` });

// open skill + mark resource
await page.goto(BASE + "#/skill/css/layout"); await page.waitForSelector(".res-row");
const before = await page.locator(".res-row.done").count();
await page.locator(".res-row .check").first().click();
ok((await page.locator(".res-row.done").count()) === before + 1, "resource toggles done");
ok((await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("skillverse:v1")).done).length)) === 1, "progress persisted to localStorage");
await page.getByRole("button", { name: "Mark skill complete" }).click();
ok(await page.getByText("Completed (undo)").isVisible(), "mark skill complete works");
await page.getByRole("button", { name: "What should I do next?" }).click(); await page.waitForTimeout(300);
ok(/completed every resource/.test(await page.locator(".bubble").last().innerText()), "coach answers from progress");

// palette
await page.keyboard.press("Control+k"); await page.waitForSelector(".palette");
await page.keyboard.type("service worker"); await page.waitForTimeout(150);
ok((await page.locator(".pal-item").count()) > 1, "palette finds results");
await page.keyboard.press("ArrowDown"); await page.keyboard.press("Escape");
ok(!(await page.locator(".palette").count()), "palette closes on Esc");
await page.keyboard.press("/"); await page.waitForSelector(".palette"); await page.keyboard.type("webgpu"); await page.keyboard.press("Enter"); await page.waitForTimeout(300);

// pages
for (const [route, sel, name] of [["/roadmap", ".rm-col", "roadmap"], ["/paths", ".path-card", "paths"], ["/paths/frontend", ".step", "path detail"], ["/upcoming", ".radar", "upcoming"], ["/progress", ".stat", "progress"], ["/list", ".list-cat", "list"], ["/community", ".sec", "community"]]) {
  await page.goto(BASE + "#" + route); await page.waitForSelector(sel, { timeout: 5000 }).then(() => ok(true, `${name} renders`), () => ok(false, `${name} renders`));
  await page.screenshot({ path: `${OUT}/${name.replace(/ /g, "-")}.png` });
}
await page.goto(BASE + "#/progress"); await page.waitForSelector(".stat");
ok(/[1-9]/.test(await page.locator(".stat b").first().innerText()), "progress page reflects completed resources");

// mobile
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const mp = await m.newPage(); mp.on("pageerror", (e) => errors.push("mobile: " + e.message));
await mp.goto(BASE + "#/"); await mp.waitForSelector(".cluster");
ok(await mp.locator(".bottom-tabs").isVisible(), "mobile bottom tabs visible");
ok(!(await mp.locator(".side.open").count()), "mobile sidebar collapsed by default");
await mp.screenshot({ path: `${OUT}/mobile-universe.png` });
await mp.goto(BASE + "#/skill/css/layout"); await mp.waitForSelector(".res-row"); await mp.screenshot({ path: `${OUT}/mobile-skill.png` });
await mp.goto(BASE + "#/roadmap"); await mp.waitForSelector(".rm-col"); await mp.screenshot({ path: `${OUT}/mobile-roadmap.png` });
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok(overflow <= 1, `no horizontal page overflow on mobile (${overflow}px)`);

ok(errors.length === 0, `no console/page errors${errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""}`);
await browser.close();
console.log(fails ? `\n${fails} check(s) failed` : "\nAll checks passed");
process.exit(fails ? 1 : 0);
