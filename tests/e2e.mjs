// E2E checks for the demo home page (Playwright from ~/.veon/tools, nothing installed in the project).
// Usage: node tests/e2e.mjs http://127.0.0.1:4321/
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const tools = process.env.VEON_TOOLS_DIR || path.join(os.homedir(), ".veon", "tools");
const { chromium } = createRequire(path.join(tools, "package.json"))("playwright");
const url = process.argv[2] || "http://127.0.0.1:4321/";
const fails = [];
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) fails.push(msg); };

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome" });

// 1. No horizontal scroll, key elements inside the screen, 320–1440.
for (const w of [320, 375, 390, 768, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const r = await page.evaluate(() => {
    const sw = document.documentElement.scrollWidth;
    const out = [...document.querySelectorAll("header a, header button, #hero a, .hero__h1")]
      .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden")
      .filter((el) => { const b = el.getBoundingClientRect(); return b.right > innerWidth + 0.5 || b.left < -0.5; })
      .map((el) => el.className || el.tagName);
    const h1 = document.querySelector("h1")?.getBoundingClientRect();
    return { sw, out, h1Bottom: h1?.bottom ?? 9999, vw: innerWidth };
  });
  ok(r.sw <= r.vw, `${w}px: no horizontal scroll (scrollWidth ${r.sw})`);
  ok(r.out.length === 0, `${w}px: header and hero controls inside the screen ${r.out.join(", ")}`);
  await page.close();
}

// 2. Content, H1, sections order, rules of the demo.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const d = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim(),
    h1n: document.querySelectorAll("h1").length,
    ids: [...document.querySelectorAll("main section[id]")].map((s) => s.id),
    lang: document.documentElement.lang,
    robots: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
    future: [...document.querySelectorAll(".future-link")].every((f) => f.getAttribute("aria-disabled") === "true" && !f.hasAttribute("href")),
  }));
  ok(d.h1 === "Медичне обладнання і меблі з 1998 року — для лікарні та для дому" && d.h1n === 1, "single H1 matches the concept");
  ok(d.ids.join(",") === "hero,directions,clinics,home-care,service,delivery,about,contacts", `section order ${d.ids.join(",")}`);
  ok(d.lang === "uk" && d.robots === "noindex", "lang uk + noindex");
  const bad = d.hrefs.filter((h) => !/^(#[\w-]+|tel:\+380\d{9}|mailto:(info|service)@biomed\.ua|viber:\/\/chat\?number=%2B380\d{9}|https:\/\/wa\.me\/380\d{9}|https:\/\/www\.youtube\.com\/@biomedua379|https:\/\/www\.google\.com\/maps\/)/.test(h));
  ok(bad.length === 0, `only allowed links ${bad.join(" ")}`);
  ok(!d.hrefs.some((h) => /https?:\/\/(www\.)?biomed\.ua/.test(h)), "no links to the current site");
  ok(d.future, "FutureLink: aria-disabled, no href");
  // anchors land on their sections
  await page.click('.hdr__nav a[href="#service"]');
  await page.waitForTimeout(1200);
  const top = await page.evaluate(() => document.getElementById("service").getBoundingClientRect().top);
  ok(Math.abs(top - 72) < 6, `anchor #service lands under the header (top ${Math.round(top)})`);
  // FutureLink note on focus
  await page.focus("#directions .dir__row");
  await page.waitForTimeout(400);
  const note = await page.evaluate(() => getComputedStyle(document.activeElement.querySelector(".future-link__note")).opacity);
  ok(Number(note) > 0, "FutureLink note «Розділ в розробці» shows on focus");
  await page.close();
}

// 3. Phone: menu, accordion, fixed bar.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(url, { waitUntil: "networkidle" });
  const barHidden = await page.evaluate(() => getComputedStyle(document.querySelector("[data-bar]")).visibility);
  ok(barHidden === "hidden", "390: action bar hidden on the first screen");
  await page.click("[data-menu-open]");
  ok(await page.isVisible("#menu"), "390: menu opens");
  await page.click('#menu a[href="#home-care"]');
  await page.waitForTimeout(1200);
  ok(!(await page.isVisible("#menu")), "390: menu closes after an anchor");
  const barShown = await page.evaluate(() => getComputedStyle(document.querySelector("[data-bar]")).visibility);
  ok(barShown === "visible", "390: action bar visible after the first screen");
  const t = page.locator(".dir__toggle").first();
  ok((await t.getAttribute("aria-expanded")) === "false", "390: directions accordion closed by default");
  await t.click();
  ok((await t.getAttribute("aria-expanded")) === "true" && (await page.isVisible("#dir-reanimation")), "390: accordion opens");
  await page.close();
}

// 4. Reduced motion and no JS: content visible.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const op = await page.evaluate(() => [...document.querySelectorAll("[data-reveal]")].map((e) => getComputedStyle(e).opacity));
  ok(op.every((o) => o === "1"), "reduced motion: reveal items visible");
  await ctx.close();
  const nojs = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const p2 = await nojs.newPage();
  await p2.goto(url, { waitUntil: "networkidle" });
  ok(await p2.isVisible("#home-care .item"), "no JS: home-care visible");
  ok(await p2.isVisible("#directions .dir__row"), "no JS: directions rows visible");
  await nojs.close();
}

await browser.close();
console.log(fails.length ? `RESULT: FAIL (${fails.length})` : "RESULT: PASS");
process.exit(fails.length ? 1 : 0);
