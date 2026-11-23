// BIOMED demo interactions. Everything degrades: without this script the content, anchors and lines are all visible.
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const phone = window.matchMedia("(max-width: 767px)");

/* Mobile menu: full-screen panel, closes on anchor choice, Escape and the close button; focus returns to the burger. */
const menu = document.querySelector<HTMLElement>("[data-menu]");
const openBtn = document.querySelector<HTMLButtonElement>("[data-menu-open]");
const closeBtn = document.querySelector<HTMLButtonElement>("[data-menu-close]");
function setMenu(open: boolean): void {
  if (!menu || !openBtn) return;
  menu.hidden = !open;
  openBtn.setAttribute("aria-expanded", String(open));
  document.documentElement.style.overflow = open ? "hidden" : "";
  if (open) closeBtn?.focus();
  else openBtn.focus();
}
openBtn?.addEventListener("click", () => setMenu(true));
closeBtn?.addEventListener("click", () => setMenu(false));
menu?.querySelectorAll<HTMLAnchorElement>("[data-menu-link]").forEach((a) =>
  a.addEventListener("click", () => {
    if (!menu) return;
    menu.hidden = true;
    openBtn?.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
  }),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu && !menu.hidden) setMenu(false);
  if (e.key === "Tab" && menu && !menu.hidden) {
    const f = [...menu.querySelectorAll<HTMLElement>("a[href], button")];
    const first = f[0];
    const last = f[f.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
phone.addEventListener("change", () => { if (!phone.matches && menu && !menu.hidden) setMenu(false); });

/* Directions accordion on phones (effect 3): all closed by default. */
document.querySelectorAll<HTMLButtonElement>(".dir__toggle").forEach((btn) => {
  btn.hidden = false;
  const item = btn.closest<HTMLElement>(".dir");
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    item?.classList.toggle("is-open", open);
  });
});

/* Active anchor in the header: the green floor line under the current section. */
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>("[data-nav]")];
const byId = new Map(navLinks.map((a) => [a.getAttribute("href")?.slice(1) ?? "", a]));
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        navLinks.forEach((a) => { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
        const link = byId.get(e.target.id);
        if (link) { link.classList.add("is-active"); link.setAttribute("aria-current", "location"); }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  document.querySelectorAll<HTMLElement>("main section[id]").forEach((s) => spy.observe(s));
}

/* Lines draw themselves (effect 1): each section's lane segment is revealed when the section enters. */
const laneHosts = [...document.querySelectorAll<HTMLElement>("main section[id]")].filter((s) => s.querySelector(".lane"));
if (reduce || !("IntersectionObserver" in window)) {
  laneHosts.forEach((s) => s.classList.add("is-drawn"));
} else {
  const draw = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("is-drawn"); draw.unobserve(e.target); }
      }
    },
    { rootMargin: "0px 0px -15% 0px", threshold: 0 },
  );
  laneHosts.forEach((s) => draw.observe(s));
}

/* Fixed action bar on phones (effect 5): shown after the first screen, hidden while contacts are visible. */
const bar = document.querySelector<HTMLElement>("[data-bar]");
const hero = document.getElementById("hero");
const contacts = document.getElementById("contacts");
if (bar && hero && contacts && "IntersectionObserver" in window) {
  bar.classList.add("is-armed");
  let pastHero = false;
  let atContacts = false;
  const sync = () => bar.classList.toggle("is-shown", pastHero && !atContacts);
  new IntersectionObserver(([e]) => { if (e) { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); } }).observe(hero);
  new IntersectionObserver(([e]) => { if (e) { atContacts = e.isIntersecting; sync(); } }, { rootMargin: "0px 0px -20% 0px" }).observe(contacts);
} else {
  bar?.classList.add("is-shown");
}

/* Hero lanes start at the signboards: measure their offset inside the hero (fallback in CSS: 55 %). */
const heroSigns = document.querySelector<HTMLElement>(".hero__signs");
function placeLanes(): void {
  if (!hero || !heroSigns) return;
  const top = heroSigns.getBoundingClientRect().top - hero.getBoundingClientRect().top;
  hero.style.setProperty("--lane-top", `${Math.round(top)}px`);
}
placeLanes();
window.addEventListener("resize", placeLanes, { passive: true });
document.fonts?.ready.then(placeLanes);
export {};
