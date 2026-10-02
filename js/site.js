/* ─────────────────────────────────────────────────────────────
   GO-LIVE VALUES — fill these in when the client sends them.
   A blank value removes its link from the page (and an empty
   block with it), so nothing can ship as a dead href="#".
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  email: "",      // e.g. "info@bravo.eu" — contact + BravoDoc pilot button
  careers: "",    // e.g. "jobs@bravo.eu" — "Send your CV"; falls back to email
  phone: "",      // e.g. "+420 000 000 000"
  address: "",    // e.g. "Na Příkopě 14, 110 00 Prague 1"
  linkedin: "",   // full URL of the company page
};

(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── config: switch links on, or remove them ─────────────── */
  const mail = (addr, subject) => "mailto:" + addr + (subject ? "?subject=" + encodeURIComponent(subject) : "");
  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.dataset.config;
    const val = (CONFIG[key] || (key === "careers" ? CONFIG.email : "") || "").trim();
    if (!val) { el.remove(); return; }
    if (key === "email" || key === "careers") {
      el.href = mail(val, el.dataset.subject);
      if (!el.textContent.trim()) el.textContent = val;
    } else if (key === "phone") {
      el.href = "tel:" + val.replace(/[^\d+]/g, "");
      el.textContent = val;
    } else if (key === "linkedin") {
      el.href = val;
    } else {
      el.textContent = val;
    }
  });
  // innermost groups first, so an emptied row also empties its list
  [...document.querySelectorAll("[data-config-group]")].reverse().forEach((g) => {
    if (!g.querySelector("[data-config]")) g.remove();
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ── edge rulers: the brand's coordinate sheet ───────────── */
  const rx = document.querySelector(".ruler--x");
  const ry = document.querySelector(".ruler--y");
  if (rx) for (let v = -30; v <= 30; v += 10) rx.insertAdjacentHTML("beforeend", `<span>${v}</span>`);
  if (ry) for (let v = 20; v >= -20; v -= 10) ry.insertAdjacentHTML("beforeend", `<span>${v}</span>`);

  /* ── drawing mode (the "B" button) ───────────────────────── */
  const egg = document.querySelector(".egg");
  const setMode = (drawing) => {
    root.classList.remove("is-switching", "is-switching-back");
    void root.offsetWidth; // restart the scan animation
    root.classList.add(drawing ? "is-switching" : "is-switching-back");
    clearTimeout(setMode.t);
    setMode.t = setTimeout(() => root.classList.remove("is-switching", "is-switching-back"), 1300);
    if (drawing) root.dataset.mode = "drawing"; else delete root.dataset.mode;
    egg.setAttribute("aria-pressed", String(drawing));
    try { localStorage.setItem("bravo-mode", drawing ? "drawing" : "photo"); } catch (e) { /* private mode */ }
  };
  egg.setAttribute("aria-pressed", String(root.dataset.mode === "drawing"));
  egg.addEventListener("click", () => setMode(root.dataset.mode !== "drawing"));

  /* ── header: transparent over the hero, solid below it ───── */
  const top = document.querySelector(".top");
  const hero = document.querySelector(".hero");
  new IntersectionObserver(([e]) => top.classList.toggle("is-solid", !e.isIntersecting), {
    rootMargin: "-72px 0px 0px 0px",
  }).observe(hero);

  /* ── the manoeuvring board ───────────────────────────────── */
  const SECTIONS = [
    { brg: 0,   id: "services",   title: "Services",   sub: "Engineering · Digital · People", text: "Engineering, digital and people — three directions, one system." },
    { brg: 60,  id: "industries", title: "Industries", sub: "Shipbuilding · Offshore · Ports", text: "Shipbuilding, offshore, port infrastructure, manufacturing and digital transformation." },
    { brg: 120, id: "about",      title: "About",      sub: "Company · Values", text: "A Czech company at the intersection of marine engineering, manufacturing and IT." },
    { brg: 180, id: "bravodoc",   title: "BravoDoc",   sub: "AI document validator", text: "Our prototype that checks engineering documents for mistakes and conflicts." },
    { brg: 240, id: "careers",    title: "Careers",    sub: "Join our crew", text: "Field teams, engineers and developers for industrial projects." },
    { brg: 300, id: "contact",    title: "Contact",    sub: "Get in touch", text: "Talk to us about a project, a pilot or a team." },
  ];
  const board = document.querySelector("[data-board]");
  if (!board) return;
  const NS = "http://www.w3.org/2000/svg";
  const card = board.querySelector("[data-card]");
  const vectors = board.querySelector("[data-vectors]");
  const list = board.querySelector("[data-nodes]");
  const hint = board.querySelector("[data-hint]");
  const coords = document.querySelector("[data-coords]");
  const C = 500, R_NODE = 300;

  // compass card: a tick every degree, numbers every 30
  const el = (name, attrs) => { const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  for (let d = 0; d < 360; d += 30) card.append(el("line", { class: "spoke", x1: C, y1: C - 96, x2: C, y2: C - 384, transform: `rotate(${d} ${C} ${C})` }));
  for (let d = 0; d < 360; d++) {
    const len = d % 10 === 0 ? 22 : d % 5 === 0 ? 14 : 7;
    const cls = d % 10 === 0 ? "tick tick--10" : d % 5 === 0 ? "tick tick--5" : "tick";
    card.append(el("line", { class: cls, x1: C, y1: C - 430, x2: C, y2: C - 430 - len, transform: `rotate(${d} ${C} ${C})` }));
  }
  for (let d = 0; d < 360; d += 30) {
    const t = el("text", { x: C, y: C - 404, transform: `rotate(${d} ${C} ${C})` });
    t.textContent = String(d).padStart(3, "0");
    card.append(t);
  }

  const nodes = SECTIONS.map((s, i) => {
    const li = document.createElement("li");
    li.className = "node";
    li.innerHTML = `<a href="#${s.id}" data-i="${i}"><span class="node__dot"></span><span class="node__label">${s.title}</span><span class="node__sub">${s.sub}</span></a>`;
    list.append(li);
    const v = el("line", {});
    vectors.append(v);
    return { ...s, li, a: li.firstElementChild, v };
  });

  // state: heading under the lubber line, in unbounded degrees
  let heading = 0, target = 0, active = -1, raf = 0, last = 0;
  const norm = (d) => ((d % 360) + 360) % 360;
  const shortest = (from, to) => from + (((to - from) % 360) + 540) % 360 - 180;
  const nearest = (h) => Math.round(h / 60) * 60;

  const readout = {
    brg: document.querySelector('[data-r="brg"]'),
    title: document.querySelector('[data-r="title"]'),
    text: document.querySelector('[data-r="text"]'),
    href: document.querySelector('[data-r="href"]'),
  };

  function layout() {
    const size = board.clientWidth, k = size / 1000;
    card.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    nodes.forEach((n) => {
      const phi = (n.brg - heading) * Math.PI / 180;
      const sx = Math.sin(phi), sy = -Math.cos(phi);
      n.li.style.transform = `translate(${(C + R_NODE * sx) * k}px, ${(C + R_NODE * sy) * k}px)`;
      n.v.setAttribute("x1", C + 80 * sx); n.v.setAttribute("y1", C + 80 * sy);
      n.v.setAttribute("x2", C + (R_NODE - 22) * sx); n.v.setAttribute("y2", C + (R_NODE - 22) * sy);
    });
    const idx = nodes.findIndex((n) => n.brg === norm(nearest(heading)));
    if (idx !== active) {
      active = idx;
      nodes.forEach((n, i) => { n.li.classList.toggle("is-active", i === idx); n.v.classList.toggle("is-active", i === idx); });
      const n = nodes[idx];
      readout.brg.textContent = String(n.brg).padStart(3, "0");
      readout.title.textContent = n.title;
      readout.text.textContent = n.text;
      readout.href.href = "#" + n.id;
    }
  }

  // critically damped approach to the target heading
  let onArrive = null;
  function tick(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!dragging) {
      heading += (target - heading) * (1 - Math.exp(-dt * 11));
      if (Math.abs(target - heading) < 0.05) heading = target;
    }
    layout();
    if (dragging || heading !== target) raf = requestAnimationFrame(tick);
    else { raf = 0; last = 0; if (onArrive) { const f = onArrive; onArrive = null; f(); } }
  }
  const run = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const steer = (to, then) => {
    target = shortest(heading, to);
    onArrive = then || null;
    if (reduced) { heading = target; layout(); if (onArrive) { const f = onArrive; onArrive = null; f(); } return; }
    run();
  };
  const dismissHint = () => hint && hint.classList.add("is-gone");

  const go = (id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    sec.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", "#" + id);
  };

  // dragging: the card follows the finger round the centre, with a flick
  let dragging = false, moved = false, startAngle = 0, startHeading = 0, samples = [];
  const angleAt = (e) => {
    const r = board.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    return { a: Math.atan2(x, -y) * 180 / Math.PI, d: Math.hypot(x, y) / (r.width / 1000) };
  };
  board.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const p = angleAt(e);
    if (p.d < 60) return; // the hub is too close to the centre to steer by
    dragging = true; moved = false;
    startAngle = p.a; startHeading = heading; samples = [{ t: e.timeStamp, h: heading }];
    onArrive = null;
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = angleAt(e);
    let delta = p.a - startAngle;
    delta = ((delta + 540) % 360) - 180;
    if (!moved && Math.abs(delta) > 2) {
      moved = true;
      board.classList.add("is-dragging");
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* already released */ }
      dismissHint();
      run();
    }
    if (!moved) return;
    heading = startHeading - delta;
    // re-anchor every half turn so |delta| never wraps
    if (Math.abs(delta) > 90) { startAngle = p.a; startHeading = heading; }
    samples.push({ t: e.timeStamp, h: heading });
    if (samples.length > 6) samples.shift();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    board.classList.remove("is-dragging");
    if (!moved) return;
    const a = samples[0], b = samples[samples.length - 1];
    const v = b.t > a.t ? (b.h - a.h) / ((b.t - a.t) / 1000) : 0; // deg/s
    const flick = Math.max(-240, Math.min(240, v * 0.22));
    target = nearest(heading + flick);
    run();
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);

  // a click that was really a drag must not navigate
  list.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-i]");
    if (!a) return;
    e.preventDefault();
    if (moved) { moved = false; return; }
    const n = nodes[+a.dataset.i];
    dismissHint();
    if (norm(nearest(heading)) === n.brg && Math.abs(target - heading) < 1) go(n.id);
    else steer(n.brg, () => setTimeout(() => go(n.id), reduced ? 0 : 180));
  });
  // tabbing through the nodes steers the board too
  list.addEventListener("focusin", (e) => {
    const a = e.target.closest("a[data-i]");
    if (a && !dragging) steer(nodes[+a.dataset.i].brg);
  });
  board.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    dismissHint();
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 60 : -60;
    const to = norm(nearest(target) + step);
    steer(to);
    const n = nodes.find((x) => x.brg === to);
    n.a.focus({ preventScroll: true });
  });
  readout.href.addEventListener("click", (e) => {
    e.preventDefault();
    go(readout.href.hash.slice(1));
  });

  // bearing and range under the pointer, as on a real plotting sheet
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" && !dragging) return;
    const p = angleAt(e);
    if (p.d > 470) { coords.textContent = "BRG ---° · RNG -.-"; return; }
    const brg = norm(Math.round(p.a + heading));
    coords.textContent = `BRG ${String(brg).padStart(3, "0")}° · RNG ${(p.d / 96).toFixed(1)}`;
  });
  hero.addEventListener("pointerleave", () => { coords.textContent = "BRG ---° · RNG -.-"; });

  // start on the section in the URL, if any
  const fromHash = nodes.find((n) => "#" + n.id === location.hash);
  if (fromHash) { heading = target = fromHash.brg; }
  new ResizeObserver(layout).observe(board);
  layout();

  // the compass in the header points at the section on screen
  const needle = document.querySelector(".top__nav svg");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && needle) needle.style.setProperty("--brg", en.target.dataset.brg + "deg");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll(".sec[data-brg]").forEach((s) => io.observe(s));
})();
