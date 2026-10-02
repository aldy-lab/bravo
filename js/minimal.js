/* Hero variant C: a quiet manoeuvring board — the real sheet's grid
   (dotted bearings to the frame, ten range rings, a degree scale) drawn
   faint, with the four pages as plotted targets and a drawing title block
   as the readout. Self-contained like plot.js, so the variants can be
   deleted independently once one is chosen. */
(() => {
  "use strict";
  const dial = document.querySelector("[data-dial]");
  if (!dial) return;
  const $ = (s, el = document) => el.querySelector(s);
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const C = 500, R = 400, UNIT = 40, STEP = 90;
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  const pad = (n) => String(n).padStart(2, "0");
  const brg3 = (d) => String(Math.round(d) % 360).padStart(3, "0");
  const norm = (d) => ((d % 360) + 360) % 360;

  const SECTIONS = [
    { brg: 0,   rng: 7.2, href: "services.html", title: "Services", text: "Field teams, engineering and supervision for industrial projects." },
    { brg: 90,  rng: 6.4, href: "projects.html", title: "Projects", text: "Projects we staff, and BravoDoc — our validator for engineering documents." },
    { brg: 180, rng: 7.6, href: "careers.html",  title: "Careers",  text: "Open positions for welders, fitters, electricians and engineers." },
    { brg: 270, rng: 6.8, href: "contact.html",  title: "Contact",  text: "Tell us about your project and the team you need." },
  ];

  /* ── the sheet ─────────────────────────────────────────── */
  const card = $("[data-card]", dial);
  const grid = el("g", { class: "mn__grid" }, card);
  for (let d = 0; d < 360; d += 10) {
    el("line", { class: d % 90 === 0 ? "mn__axis" : "mn__radial", x1: C, y1: C - UNIT, x2: C, y2: C - 720, transform: `rotate(${d} ${C} ${C})` }, grid);
  }
  for (let k = 1; k <= 10; k++) {
    el("circle", { class: k % 5 === 0 ? "mn__ring" : "mn__ring mn__ring--dot", cx: C, cy: C, r: k * UNIT, style: `--i:${k}` }, card);
  }
  const scale = el("g", { class: "mn__scale" }, card);
  for (let d = 0; d < 360; d++) {
    const len = d % 10 === 0 ? 14 : d % 5 === 0 ? 9 : 4;
    el("line", { class: d % 10 === 0 ? "mn__tick mn__tick--10" : "mn__tick", x1: C, y1: C - R, x2: C, y2: C - R - len, transform: `rotate(${d} ${C} ${C})` }, scale);
  }
  for (let d = 0; d < 360; d += 10) {
    el("text", { class: d % 30 === 0 ? "mn__num" : "mn__num mn__num--minor", x: C, y: C - R - 30, transform: `rotate(${d} ${C} ${C})` }, scale).textContent = brg3(d);
  }

  // edge rulers: the brand book's coordinate sheet, -30..30 across, -20..20 down
  const rx = $("[data-rule-x]", dial), ry = $("[data-rule-y]", dial);
  for (let v = -30; v <= 30; v += 10) rx.insertAdjacentHTML("beforeend", `<span>${v}</span>`);
  for (let v = 20; v >= -20; v -= 10) ry.insertAdjacentHTML("beforeend", `<span>${v}</span>`);

  /* ── targets ───────────────────────────────────────────── */
  const tg = $("[data-targets]", dial);
  const list = $("[data-nodes]", dial);
  const nodes = SECTIONS.map((s, i) => {
    const li = document.createElement("li");
    li.className = "mn-node";
    li.style.setProperty("--i", i);
    li.innerHTML = `<a href="${s.href}" data-i="${i}"><span class="mn-node__dot"></span><span class="mn-node__label"><b>${s.title}</b><small>TT${pad(i + 1)} · ${s.rng.toFixed(1)}</small></span></a>`;
    list.append(li);
    const g = el("g", { class: "mn-target", style: `--i:${i}` }, tg);
    const rml = el("line", { class: "mn-target__rml" }, g);
    const vec = el("line", { class: "mn-target__vec", "marker-end": "url(#mn-arrow)" }, g);
    const ping = el("circle", { class: "mn-target__ping", r: 10 }, g);
    return { ...s, li, g, rml, vec, ping };
  });

  /* ── state and drawing ─────────────────────────────────── */
  let heading = reduced ? 0 : -42, target = 0, active = -1, raf = 0, last = 0, onArrive = null;
  const shortest = (from, to) => from + (((to - from) % 360) + 540) % 360 - 180;
  const nearest = (h) => Math.round(h / STEP) * STEP;
  const read = { no: $('[data-r="no"]'), brg: $('[data-r="brg"]'), rng: $('[data-r="rng"]'), title: $('[data-r="title"]'), text: $('[data-r="text"]'), href: $('[data-r="href"]') };

  function layout() {
    const k = dial.clientWidth / 1000;
    card.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    nodes.forEach((n) => {
      const phi = (n.brg - heading) * Math.PI / 180;
      const sx = Math.sin(phi), sy = -Math.cos(phi), r = n.rng * UNIT;
      const x = C + r * sx, y = C + r * sy;
      n.vec.setAttribute("x1", x - 12 * sx); n.vec.setAttribute("y1", y - 12 * sy);
      n.vec.setAttribute("x2", x - 70 * sx); n.vec.setAttribute("y2", y - 70 * sy);
      n.rml.setAttribute("x1", x); n.rml.setAttribute("y1", y);
      n.rml.setAttribute("x2", C - R * sx); n.rml.setAttribute("y2", C - R * sy);
      n.ping.setAttribute("cx", x); n.ping.setAttribute("cy", y);
      n.li.style.transform = `translate(${x * k}px, ${y * k}px)`;
      n.li.style.setProperty("--side", sy > 0.5 ? 1 : -1); // label below the dot only for the lowest target
      n.li.classList.toggle("is-vertical", Math.abs(sx) < 0.5);
    });
    const idx = nodes.findIndex((n) => n.brg === norm(nearest(heading)));
    if (idx !== active) {
      active = idx;
      nodes.forEach((n, i) => { n.li.classList.toggle("is-active", i === idx); n.g.classList.toggle("is-active", i === idx); });
      const n = nodes[idx];
      read.no.textContent = pad(idx + 1);
      read.brg.textContent = brg3(n.brg);
      read.rng.textContent = n.rng.toFixed(1);
      read.title.textContent = n.title;
      read.text.textContent = n.text;
      read.href.href = n.href;
      const block = read.href.closest(".mn__block");
      block.classList.remove("is-flash"); void block.offsetWidth; block.classList.add("is-flash");
    }
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!dragging) {
      heading += (target - heading) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - heading) < 0.03) heading = target;
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
  const hint = $("[data-hint]");
  const dismissHint = () => hint && hint.classList.add("is-gone");

  /* ── pointer: drag to steer, cursor bearing on the rim ─── */
  const cursor = $("[data-cursor]", dial);
  const cursorRead = $("[data-cursor-read]", dial);
  const local = (e) => {
    const r = dial.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 1000 - C, y = (e.clientY - r.top) / r.height * 1000 - C;
    return { a: Math.atan2(x, -y) * 180 / Math.PI, d: Math.hypot(x, y) };
  };
  let dragging = false, moved = false, startAngle = 0, startHeading = 0, samples = [];
  dial.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const p = local(e);
    moved = false;
    if (p.d < 50) return;
    dragging = true; startAngle = p.a; startHeading = heading; samples = [{ t: e.timeStamp, h: heading }]; onArrive = null;
  });
  addEventListener("pointermove", (e) => {
    const p = local(e);
    if (e.pointerType === "mouse") {
      const over = p.d < R + 60 && p.d > 50;
      cursor.classList.toggle("is-on", over);
      if (over) cursor.setAttribute("transform", `rotate(${p.a} ${C} ${C})`);
      cursorRead.textContent = p.d <= R ? `BRG ${brg3(norm(p.a + heading))}° · RNG ${(p.d / UNIT).toFixed(1)}` : "BRG ---° · RNG -.-";
    }
    if (!dragging) return;
    const delta = ((p.a - startAngle + 540) % 360) - 180;
    if (!moved && Math.abs(delta) > 2) {
      moved = true; dial.classList.add("is-dragging");
      try { dial.setPointerCapture(e.pointerId); } catch (err) { /* released */ }
      dismissHint(); run();
    }
    if (!moved) return;
    heading = startHeading - delta;
    if (Math.abs(delta) > 90) { startAngle = p.a; startHeading = heading; }
    samples.push({ t: e.timeStamp, h: heading });
    if (samples.length > 6) samples.shift();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false; dial.classList.remove("is-dragging");
    if (!moved) return;
    const a = samples[0], b = samples[samples.length - 1];
    const v = b.t > a.t ? (b.h - a.h) / ((b.t - a.t) / 1000) : 0;
    target = nearest(heading + Math.max(-240, Math.min(240, v * 0.22)));
    run();
  };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  list.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-i]");
    if (!a) return;
    e.preventDefault();
    if (moved) { moved = false; return; }
    const n = nodes[+a.dataset.i];
    dismissHint();
    steer(n.brg, () => setTimeout(() => { location.href = n.href; }, reduced ? 0 : 160));
  });
  list.addEventListener("focusin", (e) => {
    const a = e.target.closest("a[data-i]");
    if (a && !dragging) steer(nodes[+a.dataset.i].brg);
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault(); dismissHint();
    steer(norm(nearest(target) + (e.key === "ArrowRight" ? STEP : -STEP)));
  });

  // stacked layouts: the sheet takes whatever square the copy and the title block leave
  const mn = dial.closest(".mn");
  const stacked = matchMedia("(max-width: 1099px)");
  const fit = () => {
    if (!stacked.matches) { mn.style.removeProperty("--dial"); return; }
    const cs = getComputedStyle(mn);
    const gap = parseFloat(cs.rowGap) || 0;
    const h = mn.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - $(".mn__copy").offsetHeight - $(".mn__block").offsetHeight - 2 * gap;
    const w = mn.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    mn.style.setProperty("--dial", Math.max(220, Math.min(h, w, 640)) + "px");
  };
  addEventListener("resize", fit);
  stacked.addEventListener("change", fit);
  fit();
  new ResizeObserver(layout).observe(dial);
  layout();

  // entrance: the sheet settles onto its heading while the rings and targets draw in
  requestAnimationFrame(() => {
    root.classList.add("mn-in");
    if (!reduced) setTimeout(() => steer(0), 350);
  });
})();
