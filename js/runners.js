/* Runners: when a screen changes, its crew do not simply appear at their
   stations. Each arrives over the page itself — out along the header rule,
   down onto the section's heading, across its rows and buttons, hopping
   from one to the next — and finally drops into the yard onto the spot
   where his scene figure stands, which then takes over. Slow on purpose.

   The runner is a copy of the scene's rig drawn in a fixed overlay above
   the page, posed frame by frame (walk cycle, crouch, tuck, landing). */
(() => {
  "use strict";
  const host = document.querySelector("[data-scene]");
  const wrap = document.querySelector(".in-wrap");
  if (!host || !wrap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };

  const overlay = el("svg", { class: "in-runners", "aria-hidden": "true" });
  document.body.append(overlay);
  const crewG = el("g", { class: "sc-crew" }, overlay);

  // who comes in over the page, per scene (the rest are already on site)
  const WHO = { 0: [".sc-welder", ".sc-rigger"], 1: [".sc-welder", ".sc-sparky"], 2: [".sc-painter"], 3: [".sc-recruiter"], 4: [".sc-caller", ".sc-waver"], 5: [".sc-luncher"] };
  const LEDGES = ".in-kicker, .in-h2, .in-list li, .in-tags li, .in-jobs li, .in-refs li, .in-note:not([hidden]), .in-btn, .in-path, .in-h1__l > span, .in-contact > div, .in-end__line, .in-end__meta";

  /* the rig: the same proportions as the scene figures, unit = 1 scene unit */
  const rig = () => {
    const g = el("g", {}, crewG);
    const bob = el("g", {}, g);
    const limb = (parent, x, y, len) => {
      const j = el("g", { transform: `translate(${x} ${y})` }, parent);
      const r = el("g", {}, j);
      el("line", { x1: 0, y1: 0, x2: 0, y2: len }, r);
      return r;
    };
    const arm = (side) => { const up = limb(bob, 0, -48, 11); up.classList.add("sc-arm", `sc-arm--${side}`); const fo = limb(up, 0, 11, 11); fo.classList.add("sc-arm", `sc-arm--${side}`); return [up, fo]; };
    const leg = (x) => { const th = limb(bob, x, -25, 13); th.classList.add("sc-leg"); const sh = limb(th, 0, 13, 13); sh.classList.add("sc-leg"); return [th, sh]; };
    const aL = arm("l"), lL = leg(-2), lR = leg(2);
    el("rect", { x: -7, y: -54, width: 14, height: 31, rx: 4, class: "sc-body" }, bob);
    el("line", { x1: -7, y1: -40, x2: 7, y2: -40, class: "sc-band" }, bob);
    el("line", { x1: -7, y1: -33, x2: 7, y2: -33, class: "sc-band" }, bob);
    const aR = arm("r");
    // the parachute: risers from the shoulders up to a canopy, swinging the man below it
    const chute = el("g", { class: "sc-chute in-run-chute" }, g);
    el("path", { d: "M-6 -50 L-38 -118 M6 -50 L38 -118 M0 -50 L0 -124" }, chute);
    const canopy = el("g", { class: "in-run-canopy" }, chute);
    el("path", { d: "M-44 -116 Q-44 -158 0 -160 Q44 -158 44 -116 Q33 -125 22 -116 Q11 -125 0 -116 Q-11 -125 -22 -116 Q-33 -125 -44 -116 Z", class: "sc-canopy" }, canopy);
    el("path", { d: "M-11 -159 Q0 -160 11 -159 L9 -119 Q0 -125 -9 -119 Z", class: "sc-canopy__panel" }, canopy);
    const head = el("g", { transform: "translate(0 -54)" }, bob);
    el("circle", { cx: 0, cy: -7, r: 6, class: "sc-head" }, head);
    el("path", { d: "M-7.5 -8 A7.5 7.5 0 0 1 7.5 -8 Z M-10 -8 H10", class: "sc-helmet" }, head);
    const rot = (n, a) => n.setAttribute("transform", `rotate(${a.toFixed(1)})`);
    return {
      g,
      pose(p) { // p: angles in degrees + bob offset
        bob.setAttribute("transform", `translate(0 ${(p.bob || 0).toFixed(2)})`);
        rot(aL[0], p.uaL); rot(aL[1], p.faL); rot(aR[0], p.uaR); rot(aR[1], p.faR);
        rot(lL[0], p.thL); rot(lL[1], p.shL); rot(lR[0], p.thR); rot(lR[1], p.shR);
      },
      place(x, y, s, a = 0) { g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)}) rotate(${a.toFixed(2)} 0 -130)`); },
      chute, canopy,
    };
  };

  const STAND = { bob: 0, uaL: 8, faL: 0, uaR: -8, faR: 0, thL: 0, shL: 0, thR: 0, shR: 0 };
  const walkPose = (ph, dir) => {
    const s = Math.sin(ph), c = Math.cos(ph);
    return { bob: -2.2 * Math.abs(c), uaL: 8 - 22 * s * dir, faL: 14 * dir, uaR: -8 + 22 * s * dir, faR: 14 * dir,
      thL: 22 * s * dir, shL: -Math.max(0, 34 * c) * dir, thR: -22 * s * dir, shR: -Math.max(0, -34 * c) * dir };
  };
  const crouch = (k) => ({ bob: 7 * k, uaL: 8 + 30 * k, faL: -20 * k, uaR: -8 - 30 * k, faR: 20 * k, thL: 26 * k, shL: -52 * k, thR: -26 * k, shR: 52 * k });
  const tuck = { bob: 2, uaL: 150, faL: 20, uaR: -150, faR: -20, thL: 40, shL: -70, thR: -40, shR: 70 };
  const mix = (a, b, t) => { const o = {}; for (const k in a) o[k] = a[k] + (b[k] - a[k]) * t; return o; };

  /* a journey is a list of moves: walk along a ledge, or hop to the next */
  const ledges = (sec) => [...sec.querySelectorAll(LEDGES)]
    .map((e) => e.getBoundingClientRect())
    .filter((r) => r.width > 40 && r.height > 0 && r.top > 40 && r.bottom < innerHeight)
    .sort((a, b) => a.top - b.top);

  const plan = (sec, target, i) => {
    const L = ledges(sec).filter((r) => r.top > 90);
    // each lands on a different ledge near the top, then makes his way down
    const first = L[Math.min(i, L.length - 1)];
    const rest = L.filter((r) => r !== first && r.top > (first ? first.top : 0)).filter((_, k) => k % 2 === i % 2).slice(0, 2);
    const pts = [];
    if (first) {
      const lx = first.left + Math.min(first.width - 20, 60 + i * 140 + Math.random() * 40);
      pts.push({ t: "start", x: lx + (i % 2 ? -90 : 90), y: -40 });
      pts.push({ t: "chute", x: lx, y: first.top });
      pts.push({ t: "pack" });
      const along = Math.max(first.left + 14, lx - Math.min(110, first.width * 0.35));
      if (Math.abs(along - lx) > 24) pts.push({ t: "walk", x: along, y: first.top });
    } else {
      pts.push({ t: "start", x: innerWidth * 0.5, y: -40 });
    }
    rest.forEach((r) => {
      const prevX = pts[pts.length - 1].x;
      const land = Math.max(r.left + 14, Math.min(r.right - 14, prevX - 30));
      pts.push({ t: "hop", x: land, y: r.top });
      const across = Math.max(r.left + 14, land - Math.min(100, r.width * 0.3));
      if (Math.abs(across - land) > 24) pts.push({ t: "walk", x: across, y: r.top });
    });
    pts.push({ t: "drop", target });
    return pts;
  };

  let runs = [];
  const stopAll = () => { runs.forEach((r) => r.stop()); runs = []; };

  const launch = (man, sec, i, delay) => {
    const b0 = man.getBoundingClientRect();
    const scale = Math.max(0.35, b0.height / 70);
    const steps = plan(sec, man, i);
    const r = rig();
    r.g.style.opacity = "0";
    man.style.opacity = "0";
    let k = 0, t0 = 0, raf = 0, dead = false, from = null, ph = 0, last = 0;
    const SPEED = 64; // px per second along a ledge — a stroll
    const feet = (m) => { const b = m.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.bottom }; };
    const frame = (now) => {
      if (dead) return;
      if (!t0) { t0 = now; last = now; from = { x: steps[0].x, y: steps[0].y }; k = 1; r.g.style.opacity = "1"; }
      const dt = (now - last) / 1000; last = now;
      const s = steps[k];
      if (!s) { finish(); return; }
      const sx = s.t === "drop" ? feet(s.target).x : s.x, sy = s.t === "drop" ? feet(s.target).y : s.y;
      const dist = Math.hypot(sx - from.x, sy - from.y);
      if (s.t === "chute") {
        // a slow descent, swinging under the canopy, easing off before touchdown
        const dur = 3.6, e = (now - t0) / 1000, u = Math.min(1, e / dur);
        const v = 1 - Math.pow(1 - u, 2.2);
        const swing = Math.sin(e * 2.1) * 9 * (1 - u * 0.7);
        const x = from.x + (sx - from.x) * v + Math.sin(e * 1.05) * 14 * (1 - u);
        r.place(x, from.y + (sy - from.y) * v, scale, swing);
        r.chute.style.opacity = "1";
        r.canopy.setAttribute("transform", `scale(${(1 + Math.sin(e * 3.2) * 0.03).toFixed(3)} 1)`);
        const flare = Math.max(0, (u - 0.85) / 0.15);
        r.pose({ bob: 0, uaL: 158 - flare * 20, faL: 8, uaR: -158 + flare * 20, faR: -8,
          thL: 6 * Math.sin(e * 2.6) - flare * 22, shL: 10 + flare * 30, thR: -6 * Math.sin(e * 2.6 + 0.6) + flare * 22, shR: -10 - flare * 30 });
        if (u >= 1) { from = { x: sx, y: sy }; k++; t0 = now; }
      } else if (s.t === "pack") {
        // touchdown: knees give, the canopy sags and falls behind him
        const e = (now - t0) / 1000, d = 1.1;
        const c = Math.min(1, e / 0.35);
        r.place(from.x, from.y, scale, 0);
        r.pose(e < 0.45 ? mix(STAND, crouch(1), c) : mix(crouch(1), STAND, Math.min(1, (e - 0.45) / 0.4)));
        const f = Math.min(1, e / 0.9);
        r.canopy.setAttribute("transform", `translate(${(f * 40).toFixed(1)} ${(f * 110).toFixed(1)}) scale(${(1 - f * 0.2).toFixed(3)} ${(1 - f * 0.85).toFixed(3)})`);
        r.chute.style.opacity = String(1 - f);
        if (e >= d) { r.chute.style.display = "none"; k++; t0 = now; ph = 0; }
      } else if (s.t === "walk") {
        const dur = Math.max(0.3, Math.abs(sx - from.x) / SPEED);
        const u = Math.min(1, (now - t0) / 1000 / dur);
        const dir = sx < from.x ? 1 : -1;
        ph += dt * 7.5;
        r.place(from.x + (sx - from.x) * u, from.y, scale);
        r.pose(walkPose(ph, dir));
        if (u >= 1) { from = { x: sx, y: sy }; k++; t0 = now; }
      } else { // hop or drop: crouch, arc, land
        const air = Math.min(1.4, 0.55 + dist / 500), pre = 0.22, post = 0.28;
        const e = (now - t0) / 1000;
        if (e < pre) { r.place(from.x, from.y, scale); r.pose(mix(STAND, crouch(1), e / pre)); }
        else if (e < pre + air) {
          const u = (e - pre) / air;
          const apex = Math.min(from.y, sy) - 46 * scale - dist * 0.12;
          const y = (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * apex + u * u * sy;
          r.place(from.x + (sx - from.x) * u, y, scale);
          r.pose(u < 0.5 ? mix(crouch(1), tuck, u * 2) : mix(tuck, crouch(0.9), (u - 0.5) * 2));
        } else if (e < pre + air + post) { r.place(sx, sy, scale); r.pose(mix(crouch(0.9), STAND, (e - pre - air) / post)); }
        else { from = { x: sx, y: sy }; k++; t0 = now; ph = 0; if (s.t === "drop") { finish(); return; } }
      }
      raf = requestAnimationFrame(frame);
    };
    const finish = () => {
      dead = true;
      man.style.transition = "opacity .25s"; man.style.opacity = "";
      r.g.style.transition = "opacity .25s"; r.g.style.opacity = "0";
      setTimeout(() => { r.g.remove(); man.style.transition = ""; }, 300);
    };
    const timer = setTimeout(() => { raf = requestAnimationFrame(frame); }, delay);
    const run = { stop() { clearTimeout(timer); cancelAnimationFrame(raf); if (!dead) { dead = true; r.g.remove(); man.style.opacity = ""; } } };
    return run;
  };

  // wait for the page to stop moving, then send the crew over it
  let settle = 0;
  host.addEventListener("scene:show", (e) => {
    stopAll();
    clearTimeout(settle);
    const layer = e.detail.layer;
    const step = layer.dataset.for;
    const sec = document.querySelector(`.in-sec[data-step="${step}"]`);
    const men = (WHO[step] || []).map((q) => layer.querySelector(q)).filter(Boolean);
    men.forEach((m) => { m.style.opacity = "0"; });
    let lastY = -1;
    const wait = () => {
      if (Math.abs(scrollY - lastY) > 0.5) { lastY = scrollY; settle = setTimeout(wait, 140); return; }
      if (wrap.dataset.step !== step) return;
      runs = men.map((m, i) => launch(m, sec, i, i * 1300));
    };
    settle = setTimeout(wait, 200);
  });
})();
