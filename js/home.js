/* The home page: laid out like a page of the Bravo brand
   book — running header, a staggered solid-and-outline headline,
   the radial-tick graphic element as the board, the emblem's isometric
   layers as targets, and the drawing-mode egg inking the board's dimensions.
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
    { brg: 0,   rng: 250, href: "#services", title: "Services", text: "Field teams, engineering and supervision for industrial projects." },
    { brg: 90,  rng: 250, href: "#projects", title: "Projects", text: "Projects we staff, and BravoDoc — our validator for engineering documents." },
    { brg: 180, rng: 250, href: "#careers",   title: "Careers",  text: "Open positions for welders, fitters, electricians and engineers." },
    { brg: 270, rng: 250, href: "#contact",   title: "Contact",  text: "Tell us about your project and the team you need." },
  ];

  /* the card: the brand book's graphic element — a crown of fine radial
     ticks round the centre, thin rings, and a degree scale at the rim */
  const card = $("[data-card]", board);
  [[110, ""], [220, " in-ring--dash"], [330, ""], [R, " in-ring--rim"]].forEach(([r, mod], i) =>
    el("circle", { class: "in-ring" + mod, cx: C, cy: C, r, style: `--i:${i}` }, card));
  const crown = el("g", { class: "in-crown-g" }, card);
  const scaleG = el("g", { class: "in-scale" }, card);
  for (let d = 0; d < 360; d += 6) { // the crown
    const long = d % 30 === 0;
    el("line", { class: "in-crown", x1: C, y1: C - 132, x2: C, y2: C - (long ? 178 : 158), transform: `rotate(${d} ${C} ${C})` }, crown);
  }
  for (let d = 0; d < 360; d++) {
    const len = d % 10 === 0 ? 18 : d % 5 === 0 ? 11 : 5;
    el("line", { class: d % 10 === 0 ? "in-tick in-tick--10" : "in-tick", x1: C, y1: C - R, x2: C, y2: C - R + len, transform: `rotate(${d} ${C} ${C})` }, scaleG);
  }
  for (let d = 0; d < 360; d += 30) el("text", { class: "in-num", x: C, y: C - R + 40, transform: `rotate(${d} ${C} ${C})` }, scaleG).textContent = brg3(d);

  /* the hub: the emblem rebuilt from its own paths, so its layers can land one by one */
  const hub = $("[data-hub]", board);
  const ORDER = [3, 0, 2, 1]; // symbol order is top, wall, middle, bottom; they land wall, bottom, middle, top
  document.querySelectorAll("#emblem path").forEach((src, i) => {
    const path = src.cloneNode(true);
    path.setAttribute("class", "in-hub__p");
    path.style.setProperty("--i", ORDER[i]);
    hub.append(path);
  });

  /* drawing mode: the board gains its dimensions, inked in as the mode switches */
  const dwg = $("[data-dwg]", board);
  const ink = (name, attrs) => el(name, { pathLength: 1, ...attrs }, dwg);
  ink("line", { class: "in-dim", x1: C - R, y1: C + R + 34, x2: C + R, y2: C + R + 34, "marker-start": "url(#in-dim-arrow)", "marker-end": "url(#in-dim-arrow)" });
  ink("line", { class: "in-dim in-dim--ext", x1: C - R, y1: C + 40, x2: C - R, y2: C + R + 48 });
  ink("line", { class: "in-dim in-dim--ext", x1: C + R, y1: C + 40, x2: C + R, y2: C + R + 48 });
  el("text", { class: "in-dim__t", x: C, y: C + R + 24 }, dwg).textContent = "Ø 860";
  ink("line", { class: "in-dim", x1: C, y1: C, x2: C + 330 * Math.cos(Math.PI / 4), y2: C - 330 * Math.sin(Math.PI / 4), "marker-end": "url(#in-dim-arrow)" });
  el("text", { class: "in-dim__t", x: C + 190, y: C - 214, transform: `rotate(-45 ${C + 190} ${C - 214})` }, dwg).textContent = "R 330";
  ink("line", { class: "in-dim", x1: C, y1: C, x2: C - 220 * Math.cos(Math.PI / 4), y2: C + 220 * Math.sin(Math.PI / 4), "marker-end": "url(#in-dim-arrow)" });
  el("text", { class: "in-dim__t", x: C - 118, y: C + 140, transform: `rotate(-45 ${C - 118} ${C + 140})` }, dwg).textContent = "R 220";
  ink("line", { class: "in-dim in-dim--axis", x1: C - R - 30, y1: C, x2: C + R + 30, y2: C });
  ink("line", { class: "in-dim in-dim--axis", x1: C, y1: C - R - 30, x2: C, y2: C + R + 30 });
  const arc = ink("path", { class: "in-dim in-dim--arc", "marker-end": "url(#in-dim-arrow)" });
  const arcT = el("text", { class: "in-dim__t in-dim__t--accent" }, dwg);
  el("text", { class: "in-dim__t in-dim__t--sheet", x: C + R - 4, y: C + R + 70 }, dwg).textContent = "DWG BIS-001 · REV A · SCALE 1:1";
  // the angle from the heading to the next section, dimensioned like a drawing
  const drawArc = (brgRel) => {
    const r = 372, a0 = -90, a1 = -90 + brgRel; // svg angles, 0 = east
    const p = (a) => [C + r * Math.cos(a * Math.PI / 180), C + r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    arc.setAttribute("d", Math.abs(brgRel) < 0.5 ? "" : `M${x0} ${y0} A${r} ${r} 0 ${Math.abs(brgRel) > 180 ? 1 : 0} ${brgRel > 0 ? 1 : 0} ${x1} ${y1}`);
    const [tx, ty] = p(-90 + brgRel / 2);
    arcT.setAttribute("x", tx + (brgRel / 2 > 0 ? 18 : -18)); arcT.setAttribute("y", ty - 10);
    arcT.textContent = Math.abs(brgRel) < 0.5 ? "" : `${Math.abs(Math.round(brgRel))}°`;
  };

  /* targets: the emblem's isometric layer, drawn flat on the sheet */
  const LAYER = "M0 -22 L40 -6 L0 10 L-40 -6 Z";
  const WALL = "M-40 -6 L0 10 L0 22 L-40 6 Z";
  const tg = $("[data-targets]", board), list = $("[data-labels]", board);
  const nodes = SECTIONS.map((s, i) => {
    // the label is written along a ring on the card, so it turns with the board (the ring starts at 045°, between sections, so no label is cut at its seam)
    const li = el("a", { href: s.href, "data-i": i, class: "in-node", style: `--i:${i}` }, list);
    // a wide invisible arc under the word: the tap target, whatever the angle
    const arcAt = (d) => [C + 335 * Math.sin(d * Math.PI / 180), C - 335 * Math.cos(d * Math.PI / 180)];
    const [ax0, ay0] = arcAt(s.brg - 24), [ax1, ay1] = arcAt(s.brg + 24);
    el("path", { class: "in-node__hit", d: `M${ax0} ${ay0} A335 335 0 0 1 ${ax1} ${ay1}` }, li);
    const txt = el("text", { class: "in-node__t", dy: "-14" }, li);
    el("textPath", { href: "#in-label-ring", startOffset: `${((s.brg + 315) % 360) / 3.6}%`, "text-anchor": "middle" }, txt).textContent = s.title;
    const g = el("g", { class: "in-target", style: `--i:${i}`, "data-i": i }, tg);
    const vec = el("line", { class: "in-vec" }, g);
    const mark = el("g", { class: "in-layer" }, g);
    el("path", { class: "in-layer__wall", d: WALL }, mark);
    el("path", { class: "in-layer__top", d: LAYER }, mark);
    el("circle", { class: "in-target__hit", r: 46 }, mark);
    return { ...s, i, li, g, vec, mark };
  });

  /* entrance: once per visit; instant afterwards and with reduced motion */
  const wrap = board.closest(".in-wrap");
  let seen = false;
  try { seen = !!sessionStorage.getItem("bravo-in"); sessionStorage.setItem("bravo-in", "1"); } catch (e) { /* storage off */ }
  const entrance = !reduced && !seen;
  if (!entrance) wrap.classList.add("is-ready", "is-instant");

  let heading = entrance ? -25 : 0, target = 0, active = -1, raf = 0, last = 0, onArrive = null;
  const shortest = (from, to) => from + (((to - from) % 360) + 540) % 360 - 180;
  const nearest = (h) => Math.round(h / STEP) * STEP;
  const read = { title: $('[data-r="title"]'), text: $('[data-r="text"]'), href: $('[data-r="href"]') };
  let booted = false;
  const hdg = $("[data-hdg]");

  function layout() {
    card.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    list.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    hdg.textContent = norm(heading).toFixed(1).padStart(5, "0");
    drawArc(nearest(heading) + STEP - heading); // to the next section, clockwise
    nodes.forEach((n) => {
      const phi = (n.brg - heading) * Math.PI / 180;
      const sx = Math.sin(phi), sy = -Math.cos(phi);
      const x = C + n.rng * sx, y = C + n.rng * sy;
      n.mark.setAttribute("transform", `translate(${x} ${y})`);
      n.vec.setAttribute("x1", x - 34 * sx); n.vec.setAttribute("y1", y - 34 * sy);
      n.vec.setAttribute("x2", C - 190 * sx); n.vec.setAttribute("y2", C - 190 * sy);
    });
    const idx = nodes.findIndex((n) => n.brg === norm(nearest(heading)));
    if (idx !== active) {
      active = idx;
      nodes.forEach((n, i) => [n.li, n.g].forEach((e) => e.classList.toggle("is-active", i === idx)));
      const n = nodes[idx];
      read.title.textContent = n.title; read.text.textContent = n.text; read.href.href = n.href;
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
  /* page glide: our own eased scroll, slower and softer than the browser's
     smooth scroll. Snapping is switched off while it runs, or the browser
     would snap every intermediate frame. */
  let gliding = 0;
  const glide = (toY, ms = 1100) => {
    const html = document.documentElement, from = scrollY, d = toY - from;
    cancelAnimationFrame(gliding);
    if (reduced || Math.abs(d) < 2) { window.scrollTo({ top: toY, behavior: "instant" }); return; }
    html.style.scrollSnapType = "none";
    const t0 = performance.now();
    const ease2 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const stepF = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      window.scrollTo({ top: from + d * ease2(t), behavior: "instant" }); // CSS smooth scrolling would restart every frame
      if (t < 1) gliding = requestAnimationFrame(stepF);
      else { gliding = 0; html.style.scrollSnapType = ""; }
    };
    gliding = requestAnimationFrame(stepF);
  };
  const glideTo = (el) => el && glide(el.getBoundingClientRect().top + scrollY);
  const scrollTo = (id) => {
    glideTo(document.getElementById(id));
    if (history.replaceState) history.replaceState(null, "", "#" + id);
  };
  const go = (n) => steer(n.brg, () => scrollTo(n.href.slice(1)));

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
    // off the hero the board is the navigation: where it settles, the page follows
    if (step > 0) onArrive = () => { const n = nodes.find((x) => x.brg === norm(target)); if (n) scrollTo(n.href.slice(1)); };
    run();
  };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  const onLink = (e) => {
    const a = e.target.closest("[data-i]");
    if (!a) return;
    e.preventDefault();
    if (moved) { moved = false; return; }
    go(nodes[+a.dataset.i]);
  };
  list.addEventListener("click", onLink);
  tg.addEventListener("click", onLink);
  list.addEventListener("focusin", (e) => {
    const a = e.target.closest("a[data-i]");
    if (a && !dragging) steer(nodes[+a.dataset.i].brg);
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (e.target.closest("input, textarea, select, dialog")) return;
    e.preventDefault();
    const to = norm(nearest(target) + (e.key === "ArrowRight" ? STEP : -STEP));
    if (step > 0) go(nodes.find((x) => x.brg === to)); else steer(to);
  });

  /* ── one page, one screen: the board travels with the scroll ─────────
     On the hero it fills its slot; scrolling on, it shrinks into the
     corner slot and stays there as the navigation. Position is a
     transform of the fixed board, interpolated by scroll. */
  const hero = $(".in-sec--hero"), slotHero = $(".in-slot-hero"), slotMini = $(".in-slot-mini");
  let baseW = 0, placing = 0, last2 = 0;
  const cur = { x: 0, y: 0, w: 0 }, aim = { x: 0, y: 0, w: 0 };
  const crossX = $(".in-cross__x"), crossY = $(".in-cross__y");
  const ease = (t) => t * t * (3 - 2 * t); // smoothstep: soft at both ends
  // the board follows its scroll position with a damped lag, so the start
  // of a scroll eases it out of the hero instead of yanking it
  const draw = () => {
    board.style.transform = `translate(${cur.x}px, ${cur.y}px) scale(${cur.w / baseW})`;
    const cx = cur.x + cur.w / 2, cy = cur.y + cur.w / 2;
    // crosshair: the vertical through the centre; the horizontal only from the board's
    // left edge outward, so it never runs through the text
    crossY.style.transform = `translateX(${cx}px)`;
    crossX.style.transform = `translate(${cur.x - 48}px, ${cy}px)`;
  };
  // phones: the board lives in the hero only, inside its slot, and scrolls with the
  // page natively — no per-frame flight, no docking, no crosshair
  const stage = board.parentNode;
  const phoneM = matchMedia("(max-width: 1099px)");
  // phones have no board at all (CSS hides it); a plain menu navigates instead
  const mount = () => { if (phoneM.matches) { baseW = 0; cur.w = 0; } };
  phoneM.addEventListener("change", () => { mount(); schedule(); });
  const place = (now) => {
    placing = 0;
    mount();
    if (phoneM.matches) { wrap.classList.remove("is-docked"); return; }
    const a = slotHero.getBoundingClientRect(), b = slotMini.getBoundingClientRect();
    if (!baseW || Math.abs(baseW - a.width) > 1) { baseW = a.width; board.style.width = baseW + "px"; if (!cur.w) Object.assign(cur, { x: a.left, y: a.top, w: a.width }); }
    const p = ease(Math.max(0, Math.min(1, scrollY / (hero.offsetHeight * 0.9))));
    // from where the slot sits with the page at the top, so the board glides straight to the
    // corner instead of first riding up with the hero
    const ay = a.top + scrollY;
    aim.x = a.left + (b.left - a.left) * p; aim.y = ay + (b.top - ay) * p; aim.w = a.width + (b.width - a.width) * p;
    wrap.classList.toggle("is-docked", p > 0.98);
    const dt = Math.min(0.05, ((now || performance.now()) - (last2 || now || performance.now())) / 1000); last2 = now || 0;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 9);
    let moving = false;
    ["x", "y", "w"].forEach((q) => { cur[q] += (aim[q] - cur[q]) * (dt ? k : 1); if (Math.abs(aim[q] - cur[q]) > 0.3) moving = true; else cur[q] = aim[q]; });
    draw();
    if (moving) placing = requestAnimationFrame(place); else last2 = 0;
  };
  const schedule = () => { if (!placing) placing = requestAnimationFrame(place); };
  // the crew holds still while the page moves: the scene repaints less and the scroll stays smooth
  let still = 0;
  addEventListener("scroll", () => {
    if (phoneM.matches) return;
    wrap.classList.add("is-scrolling");
    clearTimeout(still); still = setTimeout(() => wrap.classList.remove("is-scrolling"), 160);
  }, { passive: true });
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  new ResizeObserver(schedule).observe(document.documentElement);
  place();

  /* ── the section in view sets the step: board heading, scene, counter ── */
  let step = 0;
  const setStep = (n) => {
    if (n === step) return;
    step = n;
    wrap.dataset.step = n;
    const sec = $(`.in-sec[data-step="${n}"]`);
    if (sec && sec.dataset.brg && !dragging) steer(+sec.dataset.brg);
    document.querySelectorAll("[data-step-link]").forEach((a) => a.toggleAttribute("aria-current", a.dataset.stepLink === String(n)));
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setStep(+en.target.dataset.step); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll(".in-sec[data-step]").forEach((s2) => io.observe(s2));

  /* one screen per wheel notch: with mandatory snapping a short wheel
     scroll would otherwise spring back to where it started */
  const secs = [...document.querySelectorAll(".in-sec[data-step]")];
  let wheelLock = 0, wheelAcc = 0;
  addEventListener("wheel", (e) => {
    if (e.ctrlKey || document.querySelector("dialog[open]")) return;
    const cur = secs[step];
    if (cur && cur.offsetHeight > innerHeight + 4) {
      // a tall section scrolls normally until its edge, then pages on
      const r = cur.getBoundingClientRect();
      if (e.deltaY > 0 ? r.bottom > innerHeight + 2 : r.top < -2) return;
    }
    e.preventDefault();
    if (performance.now() < wheelLock) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) < 30) return;
    const next = secs[Math.max(0, Math.min(secs.length - 1, step + Math.sign(wheelAcc)))];
    wheelAcc = 0;
    if (!next || next === cur) return;
    wheelLock = performance.now() + (reduced ? 300 : 850);
    glideTo(next);
  }, { passive: false });

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.closest("[data-labels]") || e.defaultPrevented) return;
    const el = document.getElementById(a.getAttribute("href").slice(1));
    if (!el) return;
    e.preventDefault();
    glideTo(el);
  });

  /* phones: the menu */
  const menuBtn = $(".in-menu"), head = $(".in-head");
  const setMenu = (open) => { head.classList.toggle("is-open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
  menuBtn.addEventListener("click", () => setMenu(!head.classList.contains("is-open")));
  $("#in-nav").addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  layout();
  booted = true;

  if (entrance) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.classList.add("is-ready");
      setTimeout(() => steer(0), 200);
    }));
  }
})();
