/* Hero variant C: the board reduced to one ring. Self-contained like
   plot.js, so the variants can be deleted independently once one is chosen. */
(() => {
  "use strict";
  const dial = document.querySelector("[data-dial]");
  if (!dial) return;
  const $ = (s, el = document) => el.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const C = 500, R = 420, STEP = 90;
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  const brg3 = (d) => String(Math.round(d) % 360).padStart(3, "0");
  const norm = (d) => ((d % 360) + 360) % 360;

  const SECTIONS = [
    { brg: 0,   href: "services.html", title: "Services" },
    { brg: 90,  href: "projects.html", title: "Projects" },
    { brg: 180, href: "careers.html",  title: "Careers" },
    { brg: 270, href: "contact.html",  title: "Contact" },
  ];

  // one ring, a tick every 5°, numbers only at the cardinal points
  const card = $("[data-card]", dial);
  el("circle", { class: "mn__ring", cx: C, cy: C, r: R }, card);
  for (let d = 0; d < 360; d += 5) {
    el("line", { class: d % 30 === 0 ? "mn__tick mn__tick--30" : "mn__tick", x1: C, y1: C - R, x2: C, y2: C - R + (d % 30 === 0 ? 16 : 7), transform: `rotate(${d} ${C} ${C})` }, card);
  }
  for (let d = 0; d < 360; d += 90) el("text", { class: "mn__num", x: C, y: C - R + 40, transform: `rotate(${d} ${C} ${C})` }, card).textContent = brg3(d);

  const list = $("[data-nodes]", dial);
  const nodes = SECTIONS.map((s, i) => {
    const li = document.createElement("li");
    li.className = "mn-node";
    li.innerHTML = `<a href="${s.href}" data-i="${i}"><span class="mn-node__dot"></span><span class="mn-node__label">${s.title}</span></a>`;
    list.append(li);
    return { ...s, li };
  });

  let heading = 0, target = 0, active = -1, raf = 0, last = 0, onArrive = null;
  const shortest = (from, to) => from + (((to - from) % 360) + 540) % 360 - 180;
  const nearest = (h) => Math.round(h / STEP) * STEP;
  const read = { brg: $('[data-r="brg"]'), title: $('[data-r="title"]'), href: $('[data-r="href"]') };

  function layout() {
    const k = dial.clientWidth / 1000;
    card.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    nodes.forEach((n) => {
      const phi = (n.brg - heading) * Math.PI / 180;
      const x = C + R * Math.sin(phi), y = C - R * Math.cos(phi);
      n.li.style.transform = `translate(${x * k}px, ${y * k}px)`;
      // labels sit outside the ring, on the side away from the centre
      n.li.style.setProperty("--ox", Math.sin(phi).toFixed(3));
      n.li.style.setProperty("--oy", (-Math.cos(phi)).toFixed(3));
    });
    const idx = nodes.findIndex((n) => n.brg === norm(nearest(heading)));
    if (idx !== active) {
      active = idx;
      nodes.forEach((n, i) => n.li.classList.toggle("is-active", i === idx));
      read.brg.textContent = brg3(nodes[idx].brg);
      read.title.textContent = nodes[idx].title;
      read.href.href = nodes[idx].href;
    }
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!dragging) {
      heading += (target - heading) * (1 - Math.exp(-dt * 10));
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

  // drag to steer; a mouse also shows its bearing as one tick on the rim
  const cursor = $("[data-cursor]", dial);
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
    const over = e.pointerType === "mouse" && p.d < R + 60 && p.d > 50;
    cursor.classList.toggle("is-on", over);
    if (over) cursor.setAttribute("transform", `rotate(${p.a} ${C} ${C})`);
    if (!dragging) return;
    const delta = ((p.a - startAngle + 540) % 360) - 180;
    if (!moved && Math.abs(delta) > 2) {
      moved = true; dial.classList.add("is-dragging");
      try { dial.setPointerCapture(e.pointerId); } catch (err) { /* released */ }
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
    steer(n.brg, () => setTimeout(() => { location.href = n.href; }, reduced ? 0 : 160));
  });
  list.addEventListener("focusin", (e) => {
    const a = e.target.closest("a[data-i]");
    if (a && !dragging) steer(nodes[+a.dataset.i].brg);
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    steer(norm(nearest(target) + (e.key === "ArrowRight" ? STEP : -STEP)));
  });

  new ResizeObserver(layout).observe(dial);
  layout();
})();
