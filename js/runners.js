/* The runner — drawing mode only. When a screen changes, one of its crew
   runs in from the left edge onto the section heading, runs along the tops
   of its letters word by word, jumping the gaps, and off the end of the
   line: a moment of free fall, then his canopy cracks open with a jolt,
   and he glides down onto his post in the yard, flares, lands, and gathers
   the canopy — and his scene figure takes over. Until he lands his
   station's effects (the welding sparks, the megaphone) stay off. In the
   dark mode none of this happens. Same scale as the yard; posed frame by
   frame. */
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
  const WHO = { 0: ".sc-rigger", 1: ".sc-welder", 2: ".sc-inspector", 3: ".sc-recruiter", 4: ".sc-caller", 5: ".sc-signer" };
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
  // the run, moving right: a longer, faster stride, knees high, forearms bent, leaning in
  const runPose = (φ) => {
    const leg = (p) => [-34 * Math.sin(p), Math.cos(p) > 0 ? 70 * Math.sin(Math.max(0, Math.min(Math.PI, p + Math.PI / 2))) : 10];
    const [thL, shL] = leg(φ), [thR, shR] = leg(φ + Math.PI);
    return { bob: -3.5 * Math.abs(Math.cos(φ)) + 1, lean: 9, head: -4, uaL: 8 + 34 * Math.sin(φ), faL: -70, uaR: -8 + 34 * Math.sin(φ + Math.PI), faR: -70, thL, shL, thR, shR };
  };
  const tuckRun = { bob: 0, lean: 12, head: -6, uaL: 60, faL: -60, uaR: -40, faR: -70, thL: -50, shL: 80, thR: 20, shR: 40 };
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
    const line = (head && firstLine(head)) || [{ l: innerWidth * 0.2, r: innerWidth * 0.5, y: innerHeight * 0.35 }];
    const y0 = line[0].y;
    // his post: under his body (not the middle of his bounding box, which his arms pull aside)
    const body = man.querySelector(".sc-body");
    const feet = () => {
      const b = body.getBoundingClientRect();
      const legs = [...man.querySelectorAll(".sc-leg line")].map((l) => l.getBoundingClientRect().bottom);
      return { x: b.left + b.width / 2, y: legs.length ? Math.max(...legs) : b.bottom + 25 * S };
    };
    const r = rig();

    // the route: in from the left edge, along the words (hopping the gaps), off the end
    const moves = [];
    const RUN = 120 * S; // px a second: a run
    let x = -24 * S;
    line.forEach((w, i) => {
      const a0 = i ? w.l + 4 : w.l + 4;
      if (i) moves.push({ k: "gap", x0: x, x1: a0, y: w.y, d: 0.34 });
      else moves.push({ k: "run", x0: x, x1: a0, y: w.y, d: Math.abs(a0 - x) / RUN });
      moves.push({ k: "run", x0: a0, x1: w.r - 4, y: w.y, d: Math.abs(w.r - 4 - a0) / RUN });
      x = w.r - 4;
    });
    const edge = { x, y: line[line.length - 1].y };
    moves.push({ k: "leap", d: 0.7 }, { k: "open", d: 0.5 }, { k: "down", d: 2.6 }, { k: "touch", d: 0.55 }, { k: "fold", d: 0.6 }, { k: "go", d: 30 });
    // he lands a few paces short of his post, on the side he flies in from, and walks the rest
    const post0 = feet();
    const side = edge.x + 80 * S < post0.x ? -1 : 1;
    const landSpot = () => { const f = feet(); return { x: f.x + side * 64 * S, y: f.y }; };
    let acc = 0;
    moves.forEach((m) => { m.a = acc; acc += m.d; });
    const total = acc;

    let t0 = 0, raf = 0, dead = false, φ = 0, lastT = 0, openAt = null, landAt = null, walkX = 0;
    const frame = (now) => {
      if (dead) return;
      if (!t0) { t0 = now; lastT = now; }
      const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      const t = (now - t0) / 1000;
      if (t >= total) return finish();
      const m = moves.find((q) => t >= q.a && t < q.a + q.d) || moves[moves.length - 1];
      const u = Math.min(1, (t - m.a) / m.d);
      let px, py, rot = 0, pose = STAND, chute = { alpha: 0 };

      if (m.k === "run") {
        φ += (RUN * dt) / ((STRIDE * 1.5 * S) / (2 * Math.PI));
        px = m.x0 + (m.x1 - m.x0) * u; py = m.y;
        pose = runPose(φ);
      } else if (m.k === "gap") { // a running jump over the space between words
        px = m.x0 + (m.x1 - m.x0) * u; py = m.y - Math.sin(u * Math.PI) * 16 * S;
        pose = mix(runPose(φ), { ...tuckRun }, Math.sin(u * Math.PI));
      } else if (m.k === "leap") { // off the end of the line: up, out, and falling
        const ex = edge.x + 70 * S * u, ey = edge.y - Math.sin(Math.min(1, u * 1.4) * Math.PI) * 26 * S + u * u * 70 * S;
        px = ex; py = ey; rot = -10 + 34 * u;
        pose = mix(crouch(0.5), STAR, sm(u * 1.5));
        chute = { alpha: 0, pack: true };
        openAt = { x: ex, y: ey };
      } else if (m.k === "open") { // the canopy cracks open and snaps full; the jolt swings him
        const s = u < 0.35 ? 0.15 + u / 0.35 * 0.5 : 0.65 + Math.sin((u - 0.35) / 0.65 * Math.PI * 1.5) * 0.25 * (1 - u) + (u - 0.35) / 0.65 * 0.35;
        px = openAt.x + u * 10 * S; py = openAt.y + Math.sin(u * Math.PI) * 6 * S;
        rot = 24 * (1 - u) * Math.cos(u * 6);
        pose = mix(STAR, HANG, sm(u));
        chute = { open: u, alpha: 1, x: 0, y: -50 - 72 * sm(u * 1.4), sx: Math.min(1.12, s), sy: Math.min(1.15, 0.2 + s), rot: -rot * 0.4 };
      } else if (m.k === "down") { // gliding down onto his post, swinging less and less
        const f = landSpot(), from = { x: openAt.x + 10 * S, y: openAt.y };
        const v = 1 - Math.pow(1 - u, 2);
        px = from.x + (f.x - from.x) * v + Math.sin(t * 1.3) * 10 * S * (1 - u);
        py = from.y + (f.y - from.y) * v;
        rot = Math.sin((t - m.a) * 2.2) * 12 * Math.exp(-(t - m.a) * 0.8);
        const fl = sm((u - 0.82) / 0.18);
        pose = mix(HANG, { ...HANG, thL: -24, shL: 34, thR: -14, shR: 22, head: 18, uaL: 140, uaR: -140 }, fl);
        pose.head = (pose.head || 0) + (u > 0.55 ? 14 : 0);
        pose.thL += 6 * Math.sin(t * 2.4) * (1 - fl); pose.thR -= 6 * Math.sin(t * 2.4 + 0.7) * (1 - fl);
        chute = { open: 1, alpha: 1, x: 0, y: -122, sx: 1 + Math.sin(t * 3.2) * 0.03, sy: 1 - Math.sin(t * 3.2) * 0.03, rot: -rot * 0.5 };
        landAt = { x: px, y: py }; walkX = px;
      } else if (m.k === "touch") { // feet down, knees give; the canopy sags behind him
        px = landAt.x; py = landAt.y;
        pose = u < 0.4 ? mix(STAND, crouch(1), sm(u / 0.4)) : mix(crouch(1), STAND, sm((u - 0.4) / 0.6));
        const k = sm(u);
        chute = { open: 1, alpha: 1, x: 40 * k, y: -122 + 110 * k, sx: 1 - 0.2 * k, sy: 1 - 0.8 * k, rot: 60 * k };
      } else if (m.k === "fold") { // he turns, gathers it in, and it is gone
        px = landAt.x; py = landAt.y;
        pose = u < 0.6 ? mix(STAND, { ...REACH, lean: -10, uaL: -30, uaR: -70, faR: -20, head: -14 }, sm(u / 0.6)) : mix({ ...REACH, lean: -10, uaL: -30, uaR: -70, faR: -20, head: -14 }, STAND, sm((u - 0.6) / 0.4));
        chute = { open: 1, alpha: 0.75 * (1 - sm(u)), x: 40 + 8 * u, y: -12, sx: 0.8 * (1 - 0.5 * u), sy: 0.2, rot: 60 };
      } else { // go: up and over to his post on foot, from where he landed
        const f = feet();
        const dx = f.x - walkX, d = dx > 0 ? -1 : 1; // gait: +1 walks left
        const step = 60 * S * dt;
        if (Math.abs(dx) <= step + 0.5) return finish();
        walkX += Math.sign(dx) * step;
        φ += (60 * dt) / (STRIDE / (2 * Math.PI));
        px = walkX; py = f.y + (landAt.y - f.y) * 0; // on the ground he shares with his post
        py = f.y;
        pose = mix(STAND, gait(φ, d), Math.min(1, (t - m.a) * 4));
      }
      r.place(px, py, S, rot);
      r.pose(pose);
      r.chute(chute);
      raf = requestAnimationFrame(frame);
    };
    const finish = () => {
      dead = true;
      layer.classList.remove("is-awaiting");
      host.dispatchEvent(new CustomEvent("runner:arrived", { detail: { layer, step } }));
      man.style.transition = "opacity .15s"; man.style.opacity = "";
      r.g.style.transition = "opacity .15s"; r.g.style.opacity = "0";
      setTimeout(() => { r.g.remove(); man.style.transition = ""; }, 200);
    };
    raf = requestAnimationFrame(frame);
    return { stop() { cancelAnimationFrame(raf); if (!dead) { dead = true; r.g.remove(); man.style.opacity = ""; layer.classList.remove("is-awaiting"); } } };
  };

  const drawing = () => document.documentElement.dataset.mode === "drawing";
  // leaving drawing mode undoes everything, including a runner still waiting to start
  let pending = null;
  const reset = () => {
    clearTimeout(settle);
    if (run) { run.stop(); run = null; }
    if (pending) { pending.man.style.opacity = ""; pending.layer.classList.remove("is-awaiting"); pending = null; }
  };
  new MutationObserver(() => { if (!drawing()) reset(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });

  // wait for the page to stop moving, then send him in
  let settle = 0;
  host.addEventListener("scene:show", (e) => {
    reset();
    if (!drawing()) return;
    const layer = e.detail.layer, step = layer.dataset.for;
    const sec = document.querySelector(`.in-sec[data-step="${step}"]`);
    const man = layer.querySelector(WHO[step]);
    if (!man || !sec) return;
    man.style.opacity = "0";
    pending = { man, layer };
    layer.classList.add("is-awaiting"); // his station's effects wait for him
    let lastY = -1;
    const wait = () => {
      if (Math.abs(scrollY - lastY) > 0.5) { lastY = scrollY; settle = setTimeout(wait, 140); return; }
      if (wrap.dataset.step !== step) { man.style.opacity = ""; layer.classList.remove("is-awaiting"); pending = null; return; }
      pending = null;
      run = launch(man, sec, step, layer);
    };
    settle = setTimeout(wait, 200);
  });
})();
