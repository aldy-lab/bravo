/* Hero variant E: the home page laid out like a page of the Bravo brand
   book — running header, a Contents list whose page numbers are bearings,
   the radial-tick graphic element as the board, the emblem's isometric
   layers as targets, and one word across the bottom like the cover.
   Self-contained like the other variants, so it can be deleted on its own. */
(() => {
  "use strict";
  const board = document.querySelector("[data-in-board]");
  if (!board) return;
  const $ = (s, el = document) => el.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const C = 500, R = 430, STEP = 90;
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  const brg3 = (d) => String(Math.round(d) % 360).padStart(3, "0");
  const norm = (d) => ((d % 360) + 360) % 360;

  const SECTIONS = [
    { brg: 0,   rng: 270, href: "services.html", title: "Services", text: "Field teams, engineering and supervision for industrial projects." },
    { brg: 90,  rng: 250, href: "projects.html", title: "Projects", text: "Projects we staff, and BravoDoc — our validator for engineering documents." },
    { brg: 180, rng: 270, href: "careers.html",  title: "Careers",  text: "Open positions for welders, fitters, electricians and engineers." },
    { brg: 270, rng: 250, href: "contact.html",  title: "Contact",  text: "Tell us about your project and the team you need." },
  ];

  /* the card: the brand book's graphic element — a crown of fine radial
     ticks round the centre, thin rings, and a degree scale at the rim */
  const card = $("[data-card]", board);
  el("circle", { class: "in-ring in-ring--rim", cx: C, cy: C, r: R }, card);
  [110, 330].forEach((r) => el("circle", { class: "in-ring", cx: C, cy: C, r }, card));
  el("circle", { class: "in-ring in-ring--dash", cx: C, cy: C, r: 220 }, card);
  for (let d = 0; d < 360; d += 6) { // the crown
    const long = d % 30 === 0;
    el("line", { class: "in-crown", x1: C, y1: C - 132, x2: C, y2: C - (long ? 178 : 158), transform: `rotate(${d} ${C} ${C})` }, card);
  }
  for (let d = 0; d < 360; d++) {
    const len = d % 10 === 0 ? 18 : d % 5 === 0 ? 11 : 5;
    el("line", { class: d % 10 === 0 ? "in-tick in-tick--10" : "in-tick", x1: C, y1: C - R, x2: C, y2: C - R + len, transform: `rotate(${d} ${C} ${C})` }, card);
  }
  for (let d = 0; d < 360; d += 30) el("text", { class: "in-num", x: C, y: C - R + 40, transform: `rotate(${d} ${C} ${C})` }, card).textContent = brg3(d);

  /* targets: the emblem's isometric layer, drawn flat on the sheet */
  const LAYER = "M0 -22 L40 -6 L0 10 L-40 -6 Z";
  const WALL = "M-40 -6 L0 10 L0 22 L-40 6 Z";
  const tg = $("[data-targets]", board), list = $("[data-nodes]", board), spec = $("[data-spec]");
  const nodes = SECTIONS.map((s, i) => {
    const li = document.createElement("li");
    li.className = "in-node";
    li.innerHTML = `<a href="${s.href}" data-i="${i}">${s.title}</a>`;
    list.append(li);
    const row = document.createElement("li");
    row.innerHTML = `<a href="${s.href}" data-i="${i}"><span class="in-contents__n">${brg3(s.brg)}</span><span class="in-contents__t">${s.title}</span></a>`;
    spec.append(row);
    const g = el("g", { class: "in-target" }, tg);
    const vec = el("line", { class: "in-vec" }, g);
    const mark = el("g", { class: "in-layer" }, g);
    el("path", { class: "in-layer__wall", d: WALL }, mark);
    el("path", { class: "in-layer__top", d: LAYER }, mark);
    return { ...s, i, li, row, g, vec, mark };
  });

  let heading = 0, target = 0, active = -1, raf = 0, last = 0, onArrive = null;
  const shortest = (from, to) => from + (((to - from) % 360) + 540) % 360 - 180;
  const nearest = (h) => Math.round(h / STEP) * STEP;
  const read = { title: $('[data-r="title"]'), text: $('[data-r="text"]'), href: $('[data-r="href"]') };
  const page = $("[data-page]");

  function layout() {
    const k = board.clientWidth / 1000;
    card.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    nodes.forEach((n) => {
      const phi = (n.brg - heading) * Math.PI / 180;
      const sx = Math.sin(phi), sy = -Math.cos(phi);
      const x = C + n.rng * sx, y = C + n.rng * sy;
      n.mark.setAttribute("transform", `translate(${x} ${y})`);
      n.vec.setAttribute("x1", x - 34 * sx); n.vec.setAttribute("y1", y - 34 * sy);
      n.vec.setAttribute("x2", C - 190 * sx); n.vec.setAttribute("y2", C - 190 * sy);
      n.li.style.transform = `translate(${x * k}px, ${y * k}px)`;
      n.li.classList.toggle("is-low", sy > 0.5);
    });
    const idx = nodes.findIndex((n) => n.brg === norm(nearest(heading)));
    if (idx !== active) {
      active = idx;
      nodes.forEach((n, i) => [n.li, n.row, n.g].forEach((e) => e.classList.toggle("is-active", i === idx)));
      const n = nodes[idx];
      read.title.textContent = n.title; read.text.textContent = n.text; read.href.href = n.href;
      page.textContent = String(idx + 1).padStart(3, "0");
    }
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!dragging) {
      heading += (target - heading) * (1 - Math.exp(-dt * 8));
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
  const go = (n) => steer(n.brg, () => setTimeout(() => { location.href = n.href; }, reduced ? 0 : 160));

  const local = (e) => {
    const r = board.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 1000 - C, y = (e.clientY - r.top) / r.height * 1000 - C;
    return { a: Math.atan2(x, -y) * 180 / Math.PI, d: Math.hypot(x, y) };
  };
  let dragging = false, moved = false, startAngle = 0, startHeading = 0, samples = [];
  board.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const p = local(e);
    moved = false;
    if (p.d < 50) return;
    dragging = true; startAngle = p.a; startHeading = heading; samples = [{ t: e.timeStamp, h: heading }]; onArrive = null;
  });
  addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = local(e);
    const delta = ((p.a - startAngle + 540) % 360) - 180;
    if (!moved && Math.abs(delta) > 2) {
      moved = true; board.classList.add("is-dragging");
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* released */ }
      run();
    }
    if (!moved) return;
    heading = startHeading - delta;
    if (Math.abs(delta) > 90) { startAngle = p.a; startHeading = heading; }
    samples.push({ t: e.timeStamp, h: heading });
    if (samples.length > 6) samples.shift();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false; board.classList.remove("is-dragging");
    if (!moved) return;
    const a = samples[0], b = samples[samples.length - 1];
    const v = b.t > a.t ? (b.h - a.h) / ((b.t - a.t) / 1000) : 0;
    target = nearest(heading + Math.max(-240, Math.min(240, v * 0.22)));
    run();
  };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  const onLink = (e) => {
    const a = e.target.closest("a[data-i]");
    if (!a) return;
    e.preventDefault();
    if (moved) { moved = false; return; }
    go(nodes[+a.dataset.i]);
  };
  list.addEventListener("click", onLink);
  spec.addEventListener("click", onLink);
  spec.addEventListener("pointerover", (e) => {
    const a = e.target.closest("a[data-i]");
    if (a && e.pointerType === "mouse" && !dragging) steer(nodes[+a.dataset.i].brg);
  });
  [list, spec].forEach((l) => l.addEventListener("focusin", (e) => {
    const a = e.target.closest("a[data-i]");
    if (a && !dragging) steer(nodes[+a.dataset.i].brg);
  }));
  addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    steer(norm(nearest(target) + (e.key === "ArrowRight" ? STEP : -STEP)));
  });

  // the page-wide crosshair passes through the centre of the board
  const wrap = board.closest(".in-wrap");
  const align = () => {
    const w = wrap.getBoundingClientRect(), b = board.getBoundingClientRect();
    wrap.style.setProperty("--in-cx", (b.left + b.width / 2 - w.left) + "px");
    wrap.style.setProperty("--in-cy", (b.top + b.height / 2 - w.top) + "px");
  };
  new ResizeObserver(align).observe(wrap);
  new ResizeObserver(() => { layout(); align(); }).observe(board);
  layout();
})();
