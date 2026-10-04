/* The runner — drawing mode only. When a screen changes, one of its crew
   arrives over the page:

     leap      in from beyond the right edge, a short free fall, tumbling
     open      the canopy cracks open: a crumpled bundle that snaps full,
               overshoots and settles; the jolt swings him under it
     descent   he drifts down, swinging less and less, steering towards the
               end of the heading's first line, looking down as he nears it
     touchdown legs forward for the flare, a run-out of two quick steps, the
               canopy overtakes him and folds onto the letters, he gathers it
     walk      a few steps along the tops of the letters, a look down
     drop      a jump down into the yard onto his post, arms up, knees taking
               the landing — and his scene figure takes over

   Until he lands, his station's effects (the welding sparks, the megaphone)
   stay off. In the dark mode none of this happens: the crew is at work.
   Same scale as the yard (the scene's own transform); posed frame by frame. */
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

  // who makes the trip, and which of his station's effects wait for him
  const WHO = { 0: ".sc-rigger", 1: ".sc-welder", 2: ".sc-inspector", 3: ".sc-recruiter", 4: ".sc-caller", 5: ".sc-luncher" };
  const HEAD = { 0: ".in-h1", 1: ".in-h2", 2: ".in-h2", 3: ".in-h2", 4: ".in-h2", 5: ".in-end__line" };
  const CAP = 0.185; // cap top below the text box top, as a share of the font size (measured)

  /* ── the rig ───────────────────────────────────────────── */
  const LEG = 13;
  const rig = () => {
    const g = el("g", {}, crewG);
    // the parachute hangs from his shoulders; its canopy group is posed separately
    const lines = el("path", { class: "rn-lines" }, g);
    const canopy = el("g", { class: "rn-canopy" }, g);
    el("path", { d: "M-44 0 Q-44 -42 0 -44 Q44 -42 44 0 Q33 -9 22 0 Q11 -9 0 0 Q-11 -9 -22 0 Q-33 -9 -44 0 Z", class: "sc-canopy" }, canopy);
    el("path", { d: "M-11 -43 Q0 -44 11 -43 L9 -3 Q0 -9 -9 -3 Z", class: "sc-canopy__panel" }, canopy);
    const pack = el("rect", { x: -6, y: -50, width: 12, height: 9, rx: 2, class: "rn-pack" }, g);
    const bob = el("g", {}, g);
    const limb = (parent, x, y, len, cls) => {
      const j = el("g", { transform: `translate(${x} ${y})` }, parent);
      const r = el("g", { class: cls }, j);
      el("line", { x1: 0, y1: 0, x2: 0, y2: len }, r);
      return r;
    };
    const arm = (side) => { const up = limb(bob, 0, -48, 11, `rn-arm rn-arm--${side}`); return [up, limb(up, 0, 11, 11, `rn-arm rn-arm--${side}`)]; };
    const leg = (x) => { const th = limb(bob, x, -25, LEG, "rn-leg"); return [th, limb(th, 0, LEG, LEG, "rn-leg")]; };
    const aL = arm("l"), lL = leg(-2), lR = leg(2);
    el("rect", { x: -7, y: -54, width: 14, height: 31, rx: 4, class: "sc-body" }, bob);
    el("line", { x1: -7, y1: -40, x2: 7, y2: -40, class: "sc-band" }, bob);
    el("line", { x1: -7, y1: -33, x2: 7, y2: -33, class: "sc-band" }, bob);
    const aR = arm("r");
    const head = el("g", { transform: "translate(0 -54)" }, bob);
    const headR = el("g", {}, head);
    el("circle", { cx: 0, cy: -7, r: 6, class: "sc-head" }, headR);
    el("path", { d: "M-7.5 -8 A7.5 7.5 0 0 1 7.5 -8 Z M-10 -8 H10", class: "sc-helmet" }, headR);
    const rot = (n, a) => n.setAttribute("transform", `rotate(${(a || 0).toFixed(1)})`);
    return {
      g,
      pose(p) {
        bob.setAttribute("transform", `translate(0 ${(p.bob || 0).toFixed(2)}) rotate(${(p.lean || 0).toFixed(1)} 0 -25)`);
        rot(aL[0], p.uaL); rot(aL[1], p.faL); rot(aR[0], p.uaR); rot(aR[1], p.faR);
        rot(lL[0], p.thL); rot(lL[1], p.shL); rot(lR[0], p.thR); rot(lR[1], p.shR);
        rot(headR, p.head);
      },
      place(x, y, s, a = 0) { g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(4)}) rotate(${a.toFixed(2)} 0 -36)`); },
      // c: { open 0..1, x, y (skirt centre, man units), sx, sy, rot, alpha }
      chute(c) {
        if (!c || c.alpha <= 0.01) { canopy.style.opacity = "0"; lines.style.opacity = "0"; pack.style.opacity = c && c.pack ? "1" : "0"; return; }
        pack.style.opacity = c.open < 0.2 ? "1" : "0";
        canopy.style.opacity = String(c.alpha);
        lines.style.opacity = String(c.alpha * Math.min(1, c.open * 3));
        canopy.setAttribute("transform", `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${(c.rot || 0).toFixed(1)}) scale(${c.sx.toFixed(3)} ${c.sy.toFixed(3)})`);
        const ex = 40 * c.sx;
        const cs = Math.cos((c.rot || 0) * Math.PI / 180), sn = Math.sin((c.rot || 0) * Math.PI / 180);
        const P = (dx) => [c.x + dx * cs, c.y + dx * sn];
        const [lx, ly] = P(-ex), [mx, my] = P(0), [rx, ry] = P(ex);
        lines.setAttribute("d", `M-6 -48 L${lx.toFixed(1)} ${ly.toFixed(1)} M0 -50 L${mx.toFixed(1)} ${my.toFixed(1)} M6 -48 L${rx.toFixed(1)} ${ry.toFixed(1)}`);
      },
    };
  };

  /* ── poses ─────────────────────────────────────────────── */
  const STAND = { bob: 0, lean: 0, head: 0, uaL: 8, faL: 0, uaR: -8, faR: 0, thL: 0, shL: 0, thR: 0, shR: 0 };
  const crouch = (k) => ({ bob: 7 * k, lean: 0, head: 0, uaL: 8 + 34 * k, faL: -24 * k, uaR: -8 - 34 * k, faR: 24 * k, thL: 30 * k, shL: -58 * k, thR: -30 * k, shR: 58 * k });
  const STAR = { bob: 0, lean: 0, head: -10, uaL: 118, faL: 18, uaR: -118, faR: -18, thL: 22, shL: -26, thR: -22, shR: 26 };
  const HANG = { bob: 0, lean: 0, head: 0, uaL: 158, faL: 6, uaR: -158, faR: -6, thL: 4, shL: 8, thR: -4, shR: -8 };
  const REACH = { bob: 6, lean: 10, head: 14, uaL: 70, faL: -10, uaR: 30, faR: 20, thL: 26, shL: -50, thR: -24, shR: 46 };
  const mix = (a, b, t) => { const o = {}; for (const k in a) o[k] = a[k] + ((b[k] || 0) - a[k]) * t; return o; };
  const sm = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const AMP = 24, STRIDE = 2 * 2 * LEG * Math.sin(AMP * Math.PI / 180);
  const gait = (φ, d) => {
    const legAt = (p) => {
      const th = AMP * Math.sin(p);
      const knee = Math.cos(p) > 0 ? -52 * Math.sin(Math.max(0, Math.min(Math.PI, p + Math.PI / 2))) : -6;
      return [th * d, knee * d];
    };
    const [thL, shL] = legAt(φ), [thR, shR] = legAt(φ + Math.PI);
    const arm = (p) => -AMP * 0.9 * Math.sin(p);
    return { bob: -2.6 * Math.abs(Math.cos(φ)) + 1.3, lean: -3 * d, head: 2 * Math.sin(2 * φ), uaL: 8 + arm(φ) * d, faL: 18 * d, uaR: -8 + arm(φ + Math.PI) * d, faR: 18 * d, thL, shL, thR, shR };
  };

  /* ── where ─────────────────────────────────────────────── */
  const firstLine = (root) => {
    const out = [];
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const fs = parseFloat(getComputedStyle(n.parentElement).fontSize);
      const re = /\S+/g;
      let m;
      while ((m = re.exec(n.textContent))) {
        const rg = document.createRange();
        rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        const r = rg.getBoundingClientRect();
        if (r.width > 4) out.push({ l: r.left + 2, r: r.right - 2, y: r.top + CAP * fs, top: Math.round(r.top) });
      }
    }
    if (!out.length) return null;
    const top = Math.min(...out.map((w) => w.top));
    return out.filter((w) => Math.abs(w.top - top) < 6).sort((a, b) => a.l - b.l);
  };

  /* ── the trip ──────────────────────────────────────────── */
  let run = null;
  const launch = (man, sec, step, layer) => {
    const svg = host.querySelector("svg");
    const S = svg.getScreenCTM().a; // px per scene unit: the yard's own size
    const head = sec.querySelector(HEAD[step]);
    const line = head && firstLine(head);
    const last = line ? line[line.length - 1] : { l: innerWidth * 0.3, r: innerWidth * 0.5, y: innerHeight * 0.35 };
    const land = { x: last.r - 14, y: last.y };
    const stop = { x: Math.max(last.l + 10, land.x - Math.min(90, (last.r - last.l) * 0.5)), y: last.y };
    const feet = () => { const b = man.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.bottom }; };
    const r = rig();
    const start = { x: innerWidth + 30 * S, y: Math.max(40, land.y - 260) };
    const open = { x: start.x - 150 * S, y: start.y + 40 * S }; // where the canopy cracks open
    let t0 = 0, raf = 0, dead = false, φ = 0, lastT = 0;

    // phases, in seconds
    const T = { leap: 0.75, open: 0.55, down: 2.7, touch: 0.9, gather: 0.7, walk: 0, look: 0.45, drop: 1.0, settle: 0.35 };
    T.walk = Math.abs(land.x - stop.x) / (60 * S);
    const at = []; let acc = 0;
    for (const k of Object.keys(T)) { at.push([k, acc, acc + T[k]]); acc += T[k]; }
    const total = acc;

    const frame = (now) => {
      if (dead) return;
      if (!t0) { t0 = now; lastT = now; }
      const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      const t = (now - t0) / 1000;
      const ph = at.find(([, a, b]) => t >= a && t < b) || ["end", total, total];
      const [name, a, b] = ph;
      const u = b > a ? (t - a) / (b - a) : 1;
      let x, y, rot = 0, pose = STAND, chute = null;

      if (name === "leap") { // an arc in from beyond the edge, tumbling a little
        x = start.x + (open.x - start.x) * u;
        y = start.y - Math.sin(u * Math.PI) * 30 * S + u * u * 40 * S;
        rot = -20 + u * 40;
        pose = mix(crouch(0.6), STAR, sm(u * 1.6));
        chute = { alpha: 0, pack: true };
      } else if (name === "open") { // bundle → snap full → overshoot; the jolt swings him
        const s = u < 0.35 ? 0.15 + u / 0.35 * 0.5 : 0.65 + Math.sin((u - 0.35) / 0.65 * Math.PI * 1.5) * 0.25 * (1 - u) + (u - 0.35) / 0.65 * 0.35;
        x = open.x - u * 20 * S; y = open.y + Math.sin(u * Math.PI) * 6 * S;
        rot = 20 * (1 - u) * Math.cos(u * 6);
        pose = mix(STAR, HANG, sm(u));
        chute = { open: u, alpha: 1, x: 0, y: -50 - 72 * sm(u * 1.4), sx: Math.min(1.12, s), sy: Math.min(1.15, 0.2 + s), rot: -rot * 0.4 };
      } else if (name === "down") { // drift down, swinging less and less, steering in
        const v = 1 - Math.pow(1 - u, 2);
        const from = { x: open.x - 20 * S, y: open.y };
        x = from.x + (land.x - from.x) * v + Math.sin(t * 1.3) * 10 * S * (1 - u);
        y = from.y + (land.y - from.y) * v;
        rot = Math.sin((t - a) * 2.2) * 12 * Math.exp(-(t - a) * 0.8);
        const fl = sm((u - 0.82) / 0.18);
        pose = mix(HANG, { ...HANG, thL: -24, shL: 34, thR: -14, shR: 22, head: 18, uaL: 140, uaR: -140 }, fl);
        pose.head = (pose.head || 0) + (u > 0.6 ? 12 : 0);
        pose.thL += 6 * Math.sin(t * 2.4) * (1 - fl); pose.thR -= 6 * Math.sin(t * 2.4 + 0.7) * (1 - fl);
        chute = { open: 1, alpha: 1, x: 0, y: -122, sx: 1 + Math.sin(t * 3.2) * 0.03, sy: 1 - Math.sin(t * 3.2) * 0.03, rot: -rot * 0.5 };
      } else if (name === "touch") { // run-out: two quick steps, the canopy overtakes and folds
        const run = 26 * S;
        x = land.x - run * sm(u); y = land.y;
        pose = u < 0.25 ? mix(crouch(0.7), STAND, u / 0.25) : gait(u * 2.4 * Math.PI, 1);
        pose = u > 0.8 ? mix(pose, STAND, (u - 0.8) / 0.2) : pose;
        const f = sm(u);
        chute = { open: 1, alpha: 1 - 0.3 * f, x: -60 * f, y: -122 + 118 * f, sx: 1 - 0.25 * f, sy: 1 - 0.82 * f, rot: -70 * f };
      } else if (name === "gather") { // he turns to it, reaches, and it is gone
        x = land.x - 26 * S; y = land.y;
        pose = u < 0.6 ? mix(STAND, REACH, sm(u / 0.6)) : mix(REACH, STAND, sm((u - 0.6) / 0.4));
        chute = { open: 1, alpha: 0.7 * (1 - sm(u)), x: -60 - 10 * u, y: -4, sx: 0.75 * (1 - 0.5 * u), sy: 0.18, rot: -70 };
      } else if (name === "walk") {
        const from = land.x - 26 * S, d = Math.abs(stop.x - from);
        φ += (60 * dt) / ((STRIDE) / (2 * Math.PI));
        const done = Math.min(d, φ * (STRIDE * S) / (2 * Math.PI));
        x = from - done; y = land.y;
        pose = mix(STAND, gait(φ, 1), Math.min(1, u * 4));
        if (u > 0.85) pose = mix(pose, STAND, (u - 0.85) / 0.15);
      } else if (name === "look") { // stops at the edge, looks down at the yard
        x = Math.min(stop.x, land.x - 26 * S); y = land.y;
        pose = { ...STAND, head: 22 * Math.sin(u * Math.PI), lean: 4 * Math.sin(u * Math.PI), uaL: 20, uaR: -20 };
      } else if (name === "drop") { // down into the yard, arms up, onto his post
        const p0 = { x: Math.min(stop.x, land.x - 26 * S), y: land.y }, p1 = feet();
        const pre = 0.22;
        if (u < pre) { x = p0.x; y = p0.y; pose = mix(STAND, crouch(0.9), sm(u / pre)); }
        else {
          const v = (u - pre) / (1 - pre);
          const apex = p0.y - 40 * S;
          x = p0.x + (p1.x - p0.x) * v;
          y = (1 - v) * (1 - v) * p0.y + 2 * (1 - v) * v * apex + v * v * p1.y;
          pose = v < 0.5 ? mix(crouch(0.9), { ...STAND, uaL: 160, uaR: -160, thL: 20, shL: -30, thR: -10, shR: 20 }, sm(v * 2)) : mix({ ...STAND, uaL: 160, uaR: -160, thL: 20, shL: -30, thR: -10, shR: 20 }, crouch(0.6), sm((v - 0.5) * 2));
        }
      } else if (name === "settle") { // knees absorb, he stands — and the yard takes over
        const p1 = feet(); x = p1.x; y = p1.y;
        pose = mix(crouch(0.8), STAND, sm(u));
      } else { return finish(); }

      r.place(x, y, S, rot);
      r.pose(pose);
      r.chute(chute);
      raf = requestAnimationFrame(frame);
    };
    const finish = () => {
      dead = true;
      layer.classList.remove("is-awaiting");
      man.style.transition = "opacity .15s"; man.style.opacity = "";
      r.g.style.transition = "opacity .15s"; r.g.style.opacity = "0";
      setTimeout(() => { r.g.remove(); man.style.transition = ""; }, 200);
    };
    raf = requestAnimationFrame(frame);
    return { stop() { cancelAnimationFrame(raf); if (!dead) { dead = true; r.g.remove(); man.style.opacity = ""; layer.classList.remove("is-awaiting"); } } };
  };

  const drawing = () => document.documentElement.dataset.mode === "drawing";
  new MutationObserver(() => { if (!drawing() && run) { run.stop(); run = null; } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });

  // wait for the page to stop moving, then send him in
  let settle = 0;
  host.addEventListener("scene:show", (e) => {
    if (run) { run.stop(); run = null; }
    clearTimeout(settle);
    if (!drawing()) return;
    const layer = e.detail.layer, step = layer.dataset.for;
    const sec = document.querySelector(`.in-sec[data-step="${step}"]`);
    const man = layer.querySelector(WHO[step]);
    if (!man || !sec) return;
    man.style.opacity = "0";
    layer.classList.add("is-awaiting"); // his station's effects wait for him
    let lastY = -1;
    const wait = () => {
      if (Math.abs(scrollY - lastY) > 0.5) { lastY = scrollY; settle = setTimeout(wait, 140); return; }
      if (wrap.dataset.step !== step) { man.style.opacity = ""; layer.classList.remove("is-awaiting"); return; }
      run = launch(man, sec, step, layer);
    };
    settle = setTimeout(wait, 200);
  });
})();
