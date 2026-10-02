/* Hero variant B: a manoeuvring board drawn as the real plotting sheet —
   square frame, dotted bearing lines every 10°, range rings, a double
   bearing scale — with radar touches: heading line, sweep, EBL/VRM cursor,
   and the four pages plotted as tracked targets. */
(() => {
  "use strict";
  const sheet = document.querySelector("[data-plot]");
  if (!sheet) return;
  const $ = (s, el = document) => el.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const C = 500, R = 440, UNIT = 44; // ten rings of one unit
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  const pad = (n) => String(n).padStart(2, "0");
  const brg3 = (d) => String(Math.round(d) % 360).padStart(3, "0");
  const norm = (d) => ((d % 360) + 360) % 360;

  const TARGETS = [
    { brg: 0,   rng: 6.2, href: "services.html", name: "Services", text: "Field teams, engineering and supervision for industrial projects." },
    { brg: 90,  rng: 5.4, href: "projects.html", name: "Projects", text: "Projects we staff and the tools we build for them." },
    { brg: 180, rng: 6.6, href: "careers.html",  name: "Careers",  text: "Open positions for trades and engineers — apply online." },
    { brg: 270, rng: 5.8, href: "contact.html",  name: "Contact",  text: "Tell us about your project and the team you need." },
  ];
  const STEP = 90;

  /* ── the sheet ─────────────────────────────────────────── */
  const card = $("[data-card]", sheet);
  for (let d = 0; d < 360; d += 10) {
    const main = d % 90 === 0;
    el("line", {
      class: main ? "pl-axis" : d % 30 === 0 ? "pl-radial pl-radial--30" : "pl-radial",
      x1: C, y1: C - (main ? 0 : UNIT), x2: C, y2: C - 720, transform: `rotate(${d} ${C} ${C})`,
    }, card);
  }
  for (let k = 1; k <= 10; k++) el("circle", { class: k % 5 === 0 ? "pl-ring pl-ring--major" : "pl-ring", cx: C, cy: C, r: k * UNIT }, card);
  for (let d = 0; d < 360; d++) {
    const len = d % 10 === 0 ? 16 : d % 5 === 0 ? 10 : 5;
    el("line", { class: d % 10 === 0 ? "pl-tick pl-tick--10" : "pl-tick", x1: C, y1: C - R, x2: C, y2: C - R - len, transform: `rotate(${d} ${C} ${C})` }, card);
  }
  for (let d = 0; d < 360; d += 10) {
    el("text", { class: "pl-num", x: C, y: C - R - 30, transform: `rotate(${d} ${C} ${C})` }, card).textContent = brg3(d);
    el("text", { class: "pl-num pl-num--rev", x: C, y: C - R + 16, transform: `rotate(${d} ${C} ${C})` }, card).textContent = brg3(d + 180);
  }
  el("path", { class: "pl-north", d: `M${C} ${C - R - 62} l-7 14 h14 z` }, card);

  /* ── targets ───────────────────────────────────────────── */
  const tg = $("[data-targets]", sheet);
  const labels = $("[data-labels]", sheet);
  const rows = $("[data-rows]");
  const targets = TARGETS.map((t, i) => {
    const g = el("g", { class: "pl-target" }, tg);
    const rml = el("line", { class: "pl-rml" }, g);           // relative motion line
    const vec = el("line", { class: "pl-vec", "marker-end": "url(#pl-arrow)" }, g);
    const dot = el("circle", { class: "pl-dot", r: 7 }, g);
    const box = el("path", { class: "pl-box" }, g);           // ARPA acquisition brackets
    const li = document.createElement("li");
    li.className = "pl-label";
    li.innerHTML = `<a href="${t.href}" data-i="${i}"><b>${t.name}</b><span>TT${pad(i + 1)} · ${brg3(t.brg)}° · ${t.rng.toFixed(1)}</span></a>`;
    labels.append(li);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${pad(i + 1)}</td><td><a href="${t.href}" data-i="${i}">${t.name}</a></td><td>${brg3(t.brg)}°</td><td>${t.rng.toFixed(1)}</td>`;
    rows.append(tr);
    return { ...t, i, g, rml, vec, dot, box, li, tr };
  });

  /* ── state and drawing ─────────────────────────────────── */
  let heading = 0, target = 0, active = -1, raf = 0, last = 0, onArrive = null;
  const shortest = (from, to) => from + (((to - from) % 360) + 540) % 360 - 180;
  const nearest = (h) => Math.round(h / STEP) * STEP;
  const hdg = $("[data-hdg]"), tt = $("[data-tt]");
  const detail = { no: $('[data-d="no"]'), name: $('[data-d="name"]'), text: $('[data-d="text"]'), href: $('[data-d="href"]') };
  const at = (brg, r) => {
    const phi = (brg - heading) * Math.PI / 180;
    return [C + r * Math.sin(phi), C - r * Math.cos(phi)];
  };

  function layout() {
    const k = sheet.clientWidth / 1000;
    card.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    hdg.textContent = norm(heading).toFixed(1).padStart(5, "0") + "°";
    const idx = targets.findIndex((t) => t.brg === norm(nearest(heading)));
    targets.forEach((t) => {
      const [x, y] = at(t.brg, t.rng * UNIT);
      const [vx, vy] = at(t.brg, t.rng * UNIT - 74);            // vectors close on own position
      const [ex, ey] = at(t.brg + 180, R);
      t.dot.setAttribute("cx", x); t.dot.setAttribute("cy", y);
      t.vec.setAttribute("x1", x); t.vec.setAttribute("y1", y); t.vec.setAttribute("x2", vx); t.vec.setAttribute("y2", vy);
      t.rml.setAttribute("x1", x); t.rml.setAttribute("y1", y); t.rml.setAttribute("x2", ex); t.rml.setAttribute("y2", ey);
      const s = 18, b = 7;
      t.box.setAttribute("d", `M${x - s} ${y - s + b}v${-b}h${b}M${x + s - b} ${y - s}h${b}v${b}M${x + s} ${y + s - b}v${b}h${-b}M${x - s + b} ${y + s}h${-b}v${-b}`);
      const flip = x > 640; // labels on the right-hand side read leftwards, so they never run off the sheet
      t.li.classList.toggle("is-flip", flip);
      t.li.style.transform = `translate(${(flip ? x - 22 : x + 22) * k}px, ${(y - 14) * k}px)`;
    });
    if (idx !== active) {
      active = idx;
      targets.forEach((t, i) => {
        t.g.classList.toggle("is-active", i === idx);
        t.li.classList.toggle("is-active", i === idx);
        t.tr.classList.toggle("is-active", i === idx);
      });
      const t = targets[idx];
      tt.textContent = pad(idx + 1);
      detail.no.textContent = pad(idx + 1);
      detail.name.textContent = t.name;
      detail.text.textContent = t.text;
      detail.href.href = t.href;
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
  const hint = $("[data-hint]");
  const dismissHint = () => hint && hint.classList.add("is-gone");
  const go = (t) => { dismissHint(); steer(t.brg, () => setTimeout(() => { location.href = t.href; }, reduced ? 0 : 160)); };

  /* ── radar sweep (screen space, independent of heading) ── */
  const sweep = $("[data-sweep]", sheet);
  if (!reduced) {
    const g = sweep.parentNode;
    sweep.remove();
    const SLICES = 14;
    const wedges = Array.from({ length: SLICES }, (_, i) => el("path", { class: "pl-wedge", "fill-opacity": (0.16 * (1 - i / SLICES)).toFixed(3) }, g));
    const wedge = (a0, a1) => {
      const p = (a) => [C + R * Math.sin(a * Math.PI / 180), C - R * Math.cos(a * Math.PI / 180)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `M${C} ${C}L${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}Z`;
    };
    const line = el("line", { class: "pl-sweep-line", x1: C, y1: C }, g);
    let a = 0, prev = 0;
    const spin = (now) => {
      a = (a + ((now - (prev || now)) / 1000) * 60) % 360; prev = now; // one turn in six seconds
      wedges.forEach((w, i) => w.setAttribute("d", wedge(a - (i + 1) * 3, a - i * 3)));
      line.setAttribute("x2", C + R * Math.sin(a * Math.PI / 180)); line.setAttribute("y2", C - R * Math.cos(a * Math.PI / 180));
      requestAnimationFrame(spin);
    };
    requestAnimationFrame(spin);
  } else sweep.remove();

  /* ── pointer: drag to steer, EBL/VRM cursor when hovering ─ */
  const cursorG = $("[data-cursor]", sheet), ebl = $("[data-ebl]", sheet), vrm = $("[data-vrm]", sheet);
  const read = $("[data-cursor-read]", sheet);
  const local = (e) => {
    const r = sheet.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 1000 - C, y = (e.clientY - r.top) / r.height * 1000 - C;
    return { a: Math.atan2(x, -y) * 180 / Math.PI, d: Math.hypot(x, y), x: x + C, y: y + C };
  };
  let dragging = false, moved = false, startAngle = 0, startHeading = 0, samples = [];
  sheet.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const p = local(e);
    moved = false;
    if (p.d < 50) return;
    dragging = true; startAngle = p.a; startHeading = heading; samples = [{ t: e.timeStamp, h: heading }]; onArrive = null;
  });
  addEventListener("pointermove", (e) => {
    const p = local(e);
    if (e.pointerType === "mouse" || dragging) {
      const inside = p.d <= R && e.target.closest("[data-plot]");
      cursorG.classList.toggle("is-on", !!inside);
      if (inside) {
        ebl.setAttribute("x2", C + R * Math.sin(p.a * Math.PI / 180)); ebl.setAttribute("y2", C - R * Math.cos(p.a * Math.PI / 180));
        vrm.setAttribute("r", p.d);
        read.textContent = `CURSOR ${brg3(norm(p.a + heading))}° · ${(p.d / UNIT).toFixed(1)}`;
      } else read.textContent = "CURSOR ---° · -.-";
    }
    if (!dragging) return;
    const delta = ((p.a - startAngle + 540) % 360) - 180;
    if (!moved && Math.abs(delta) > 2) {
      moved = true; sheet.classList.add("is-dragging");
      try { sheet.setPointerCapture(e.pointerId); } catch (err) { /* released */ }
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
    dragging = false; sheet.classList.remove("is-dragging");
    if (!moved) return;
    const a = samples[0], b = samples[samples.length - 1];
    const v = b.t > a.t ? (b.h - a.h) / ((b.t - a.t) / 1000) : 0;
    target = nearest(heading + Math.max(-240, Math.min(240, v * 0.22)));
    run();
  };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  /* ── links on the sheet and in the target table ────────── */
  const onLink = (e) => {
    const a = e.target.closest("a[data-i]");
    if (!a) return;
    e.preventDefault();
    if (moved) { moved = false; return; }
    go(targets[+a.dataset.i]);
  };
  labels.addEventListener("click", onLink);
  rows.addEventListener("click", onLink);
  rows.addEventListener("pointerover", (e) => {
    const tr = e.target.closest("tr");
    if (tr && e.pointerType === "mouse" && !dragging) steer(targets[[...rows.children].indexOf(tr)].brg);
  });
  [labels, rows].forEach((list) => list.addEventListener("focusin", (e) => {
    const a = e.target.closest("a[data-i]");
    if (a && !dragging) steer(targets[+a.dataset.i].brg);
  }));
  addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (e.target.closest("input, textarea, select")) return;
    e.preventDefault(); dismissHint();
    steer(norm(nearest(target) + (e.key === "ArrowRight" ? STEP : -STEP)));
  });

  new ResizeObserver(layout).observe(sheet);
  layout();
})();
