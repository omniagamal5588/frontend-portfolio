/* ============================================================
   Omnia Gamal — Portfolio · interactions & rendering
   ============================================================ */
(function () {
  "use strict";

  const IMAGES = window.PORTFOLIO_IMAGES || {};

  /* ---- project metadata (keyed by manifest slug) ---- */
  const PROJECTS = [
    {
      slug: "sela",
      title: "Sela SuperApp",
      tag: "Employee Engagement",
      type: "Enterprise SuperApp",
      cover: "sela-wall",
      wide: true,
      stack: ["Next.js", "TypeScript", "React Query", "Tailwind CSS", "Shadcn UI"],
      desc:
        "An employee super-app pairing a social wall — feed, reactions, sharing and chat-based shared content — with a multi-step Strategy Fit evaluation engine whose form flow branches by project type with scenario-based validation.",
    },
    {
      slug: "elgarage",
      title: "El Garage",
      tag: "Automotive E-Commerce",
      type: "E-Commerce",
      cover: "home-page",
      stack: ["Next.js", "JavaScript", "SCSS", "Zustand", "Axios", "GSAP"],
      desc:
        "Automotive-equipment store with brand and country-of-origin filtering, multi-product compare, error-code lookup, and a quote-request cart. Full Arabic/English RTL/LTR with GSAP page transitions.",
    },
    {
      slug: "sellicon",
      title: "Silicon21-HQ",
      tag: "Corporate Website",
      type: "Corporate",
      cover: "landing-page",
      stack: ["Next.js", "TypeScript", "React Query", "Tailwind CSS", "Shadcn UI"],
      desc:
        "Corporate site with animated, responsive UI. Dynamic vendor and partner listings driven by REST data, plus a structured media center — news, video, gallery and downloadable resources.",
    },
    {
      slug: "mobdra",
      title: "Mobdra",
      tag: "Car Import Platform",
      type: "E-Commerce",
      cover: "home-page",
      stack: ["Next.js", "JavaScript", "Bootstrap", "Zustand", "Formik", "REST APIs"],
      desc:
        "Car-import marketplace for Egyptian expats. Dynamic multi-condition registration forms adapt to each import scenario; vehicle catalog, cart and multilingual pages, rebuilt for full cross-device responsiveness.",
    },
    {
      slug: "g1-landscape",
      title: "G1 Landscape",
      tag: "Landscaping & Maintenance",
      type: "Business Website",
      cover: "home-page",
      stack: ["Next.js", "React", "Responsive UI"],
      desc:
        "Marketing site for a landscaping and maintenance company — services, project showcase, team and clients — across ten responsive, content-driven pages.",
    },
    {
      slug: "tree-systems",
      title: "Tree Systems",
      tag: "Corporate Website",
      type: "Corporate",
      cover: "home-page",
      stack: ["Next.js", "React", "Responsive UI"],
      desc:
        "Corporate website with services, portfolio and contact sections — a clean, responsive layout with clear content structure.",
    },
  ];

  /* order images so the cover comes first */
  function orderedImages(p) {
    const imgs = (IMAGES[p.slug] || []).slice();
    const i = imgs.findIndex((x) => x.slug === p.cover);
    if (i > 0) imgs.unshift(imgs.splice(i, 1)[0]);
    return imgs;
  }

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---- render project cards ---- */
  const galleries = {}; // slug -> ordered image list (for lightbox)

  function renderProjects() {
    const host = document.getElementById("projects");
    if (!host) return;
    host.innerHTML = PROJECTS.map((p) => {
      const imgs = orderedImages(p);
      galleries[p.slug] = imgs;
      const cover = imgs[0];
      const rest = imgs.slice(1);
      const MAX = 5;
      const thumbs = rest
        .slice(0, MAX)
        .map(
          (im, k) =>
            `<button class="thumb" data-proj="${p.slug}" data-idx="${k + 1}" aria-label="${esc(
              im.caption
            )}"><img src="${im.thumb}" alt="${esc(p.title)} — ${esc(im.caption)}" loading="lazy"></button>`
        )
        .join("");
      const more =
        rest.length > MAX
          ? `<button class="thumb thumb--more" data-proj="${p.slug}" data-idx="${MAX + 1}" aria-label="See all screens">+${
              rest.length - MAX
            }</button>`
          : "";
      const chips = p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("");
      return `
      <article class="project${p.wide ? " project--wide" : ""}">
        <div class="project__cover" data-proj="${p.slug}" data-idx="0" role="button" tabindex="0" aria-label="Open ${esc(
        p.title
      )} gallery">
          <span class="project__type">${esc(p.type)}</span>
          <img src="${cover.thumb}" alt="${esc(p.title)} — ${esc(cover.caption)}" loading="lazy">
          <span class="project__zoom"><span>${imgs.length} screens · click to view ↗</span></span>
        </div>
        <div class="project__body">
          <div class="project__titlerow">
            <h3 class="project__title">${esc(p.title)}</h3>
            <span class="project__tag">${esc(p.tag)}</span>
          </div>
          <p class="project__desc">${esc(p.desc)}</p>
          <div class="project__stack">${chips}</div>
          <div class="project__thumbs">${thumbs}${more}</div>
        </div>
      </article>`;
    }).join("");
  }

  /* ---- skills tokens ---- */
  const SKILLS = [
    { k: "Languages", items: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3"] },
    { k: "Frameworks", items: ["React.js", "Next.js", "React Native"] },
    { k: "State", items: ["Redux Toolkit", "Zustand", "React Query"] },
    { k: "Forms", items: ["React Hook Form", "Formik", "Zod"] },
    { k: "Styling & UI", items: ["Tailwind CSS", "Shadcn UI", "Bootstrap", "Figma"] },
    { k: "Tools", items: ["Axios", "REST APIs", "next-intl (i18n)", "Git"] },
  ];
  function renderSkills() {
    const host = document.getElementById("skills-grid");
    if (!host) return;
    host.innerHTML = SKILLS.map(
      (g) => `
      <div class="token-group">
        <p class="token-group__k">${esc(g.k)}</p>
        <div class="token-group__items">${g.items
          .map((i) => `<span class="chip">${esc(i)}</span>`)
          .join("")}</div>
      </div>`
    ).join("");
  }

  /* ---- lightbox ---- */
  const lb = {
    el: document.getElementById("lightbox"),
    img: document.getElementById("lbImg"),
    proj: document.getElementById("lbProject"),
    cap: document.getElementById("lbCaption"),
    count: document.getElementById("lbCount"),
    list: [],
    title: "",
    i: 0,
  };
  function openLB(slug, idx) {
    lb.list = galleries[slug] || [];
    if (!lb.list.length) return;
    lb.title = (PROJECTS.find((p) => p.slug === slug) || {}).title || "";
    lb.i = Math.max(0, Math.min(idx, lb.list.length - 1));
    showLB();
    lb.el.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }
  function showLB() {
    const it = lb.list[lb.i];
    lb.img.src = it.full;
    lb.img.alt = lb.title + " — " + it.caption;
    lb.proj.textContent = lb.title;
    lb.cap.textContent = it.caption;
    lb.count.textContent = lb.i + 1 + " / " + lb.list.length;
  }
  function closeLB() {
    lb.el.hidden = true;
    lb.img.src = "";
    document.body.style.overflow = "";
  }
  function stepLB(d) {
    lb.i = (lb.i + d + lb.list.length) % lb.list.length;
    showLB();
  }

  function wireEvents() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-proj]");
      if (t) {
        openLB(t.dataset.proj, parseInt(t.dataset.idx, 10) || 0);
      }
    });
    document.addEventListener("keydown", (e) => {
      const t = e.target.closest && e.target.closest(".project__cover");
      if (t && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openLB(t.dataset.proj, 0);
      }
      if (lb.el.hidden) return;
      if (e.key === "Escape") closeLB();
      if (e.key === "ArrowRight") stepLB(1);
      if (e.key === "ArrowLeft") stepLB(-1);
    });
    document.getElementById("lbClose").addEventListener("click", closeLB);
    document.getElementById("lbNext").addEventListener("click", () => stepLB(1));
    document.getElementById("lbPrev").addEventListener("click", () => stepLB(-1));
    lb.el.addEventListener("click", (e) => {
      if (e.target === lb.el || e.target.classList.contains("lb__figure")) closeLB();
    });
  }

  /* ---- signature: live RTL/LTR i18n toggle ---- */
  const I18N = {
    en: { badge: "New", title: "Welcome back", body: "Pick up where you left off and keep building.", primary: "Get started", secondary: "Later" },
    ar: { badge: "جديد", title: "أهلاً بعودتك", body: "أكمل من حيث توقّفت وواصل البناء.", primary: "ابدأ الآن", secondary: "لاحقاً" },
  };
  function wireToggle() {
    const card = document.getElementById("demoCard");
    const btns = document.querySelectorAll(".dir-btn");
    if (!card) return;
    btns.forEach((b) =>
      b.addEventListener("click", () => {
        const lang = b.dataset.lang;
        const dir = b.dataset.dir;
        btns.forEach((x) => x.classList.toggle("is-active", x === b));
        card.dir = dir;
        card.lang = lang;
        const dict = I18N[lang];
        card.querySelectorAll("[data-i18n]").forEach((n) => {
          const val = dict[n.dataset.i18n];
          const svg = n.querySelector("svg");
          if (svg) {
            const first = n.firstChild;
            if (first && first.nodeType === 3) first.textContent = val + " ";
            else n.insertBefore(document.createTextNode(val + " "), svg);
          } else {
            n.textContent = val;
          }
        });
      })
    );
  }

  /* ---- scroll reveal ---- */
  function wireReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((e) => io.observe(e));
    requestAnimationFrame(() =>
      document.querySelectorAll(".hero .reveal").forEach((e) => e.classList.add("in"))
    );
  }

  function tagReveals() {
    document.querySelectorAll(".section__head, .project, .token-group, .xp, .fact")
      .forEach((e, i) => { e.classList.add("reveal"); e.dataset.delay = String((i % 4) + 1); });
  }

  function init() {
    renderProjects();
    renderSkills();
    const c = document.getElementById("projCount");
    if (c) c.textContent = PROJECTS.length;
    tagReveals();
    wireEvents();
    wireToggle();
    wireReveal();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

