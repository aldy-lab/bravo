/* Hero variant D: the manoeuvring board as an ink illustration on white,
   with the pages as a product-style spec list. Self-contained like the
   other variants, so it can be deleted on its own. */
(() => {
  "use strict";
  const board = document.querySelector("[data-te-board]");
  if (!board) return;
  const $ = (s, el = document) => el.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const C = 500, R = 440, STEP = 90;
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  const brg3 = (d) => String(Math.round(d) % 360).padStart(3, "0");
  const norm = (d) => ((d % 360) + 360) % 360;

  const SECTIONS = [
    { brg: 0,   rng: 250, href: "services.html", title: "services", text: "field teams, engineering and supervision for industrial projects." },
    { brg: 90,  rng: 240, href: "projects.html", title: "projects", text: "projects we staff, and bravodoc — our validator for engineering documents." },
    { brg: 180, rng: 250, href: "careers.html",  title: "careers",  text: "open positions for welders, fitters, electricians and engineers." },
    { brg: 270, rng: 240, href: "contact.html",  title: "contact",  text: "tell us about your project and the team you need." },
  ];

  // the card: bold ink scale, a few rings, numbers in the poster face
  const card = $("[data-card]", board);
  el("circle", { class: "te-ring te-ring--rim", cx: C, cy: C, r: R }, card);
  [120, 240, 360].forEach((r) => el("circle", { class: "te-ring", cx: C, cy: C, r }, card));
  for (let d = 0; d < 360; d += 30) el("line", { class: "te-spoke", x1: C, y1: C - 40, x2: C, y2: C - 360, transform: `rotate(${d} ${C} ${C})` }, card);
  for (let d = 0; d < 360; d += 2) {
    const big = d % 10 === 0;
    el("line", { class: big ? "te-tick te-tick--big" : "te-tick", x1: C, y1: C - R, x2: C, y2: C - R + (big ? 34 : 16), transform: `rotate(${d} ${C} ${C})` }, card);
  }
  for (let d = 0; d < 360; d += 30) el("text", { class: "te-num", x: C, y: C - R + 66, transform: `rotate(${d} ${C} ${C})` }, card).textContent = brg3(d);

  const tg = $("[data-targets]", board), list = $("[data-nodes]", board), spec = $("[data-spec]");
  const nodes = SECTIONS.map((s, i) => {
    const li = document.createElement("li");
    li.className = "te-node";
    li.innerHTML = `<a href="${s.href}" data-i="${i}"><span>${s.title}</span></a>`;
    list.append(li);
    const row = document.createElement("li");
    row.innerHTML = `<a href="${s.href}" data-i="${i}"><span class="te-spec__no">tt–0${i + 1}</span><span class="te-spec__name">${s.title}</span><span class="te-spec__v">${brg3(s.brg)}</span></a>`;
    spec.append(row);
    const g = el("g", { class: "te-target" }, tg);
    const vec = el("line", { class: "te-vec", "marker-end": "url(#te-arrow)" }, g);
    const dot = el("circle", { class: "te-dot", r: 22 }, g);
    return { ...s, li, row, g, vec, dot };
  });

  let heading = 0, target = 0, active = -1, raf = 0, last = 0, onArrive = null;
  const shortest = (from, to) => from + (((to - from) % 360) + 540) % 360 - 180;
  const nearest = (h) => Math.round(h / STEP) * STEP;
  const read = { title: $('[data-r="title"]'), text: $('[data-r="text"]'), href: $('[data-r="href"]') };

  function layout() {
    const k = board.clientWidth / 1000;
    card.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    nodes.forEach((n) => {
      const phi = (n.brg - heading) * Math.PI / 180;
      const sx = Math.sin(phi), sy = -Math.cos(phi);
      const x = C + n.rng * sx, y = C + n.rng * sy;
      n.dot.setAttribute("cx", x); n.dot.setAttribute("cy", y);
      n.vec.setAttribute("x1", x - 30 * sx); n.vec.setAttribute("y1", y - 30 * sy);
      n.vec.setAttribute("x2", x - 120 * sx); n.vec.setAttribute("y2", y - 120 * sy);
      n.li.style.transform = `translate(${x * k}px, ${y * k}px)`;
      n.li.classList.toggle("is-low", sy > 0.5);
      n.li.classList.toggle("is-side", Math.abs(sx) > 0.5);
      n.li.classList.toggle("is-right", sx > 0.5);
    });
    const idx = nodes.findIndex((n) => n.brg === norm(nearest(heading)));
    if (idx !== active) {
      active = idx;
      nodes.forEach((n, i) => [n.li, n.row, n.g].forEach((e) => e.classList.toggle("is-active", i === idx)));
      const n = nodes[idx];
      read.title.textContent = n.title; read.text.textContent = n.text; read.href.href = n.href;
    }
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!dragging) {
      heading += (target - heading) * (1 - Math.exp(-dt * 9));
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

  new ResizeObserver(layout).observe(board);
  layout();
})();
