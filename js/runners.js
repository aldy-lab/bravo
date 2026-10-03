/* The runner: when a screen changes, one of its crew arrives over the page.
   He drops in by parachute onto the section heading, walks along the tops
   of its letters word by word, hops the gaps between words, jumps down to
   the next line, makes his way down the page and drops into the yard onto
   the spot where his scene figure stands, which then takes over.

   He is the same size as the crew in the yard (the scene's own scale), and
   he is posed frame by frame: a real gait — the stance leg straight and
   carrying him at the speed of his stride, the swing leg folding at the
   knee, arms in counter-swing, hips rising over the planted foot. */
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

  // who makes the trip, per screen
  const WHO = { 0: ".sc-rigger", 1: ".sc-welder", 2: ".sc-painter", 3: ".sc-recruiter", 4: ".sc-caller", 5: ".sc-luncher" };
  const HEAD = { 0: ".in-h1", 1: ".in-h2", 2: ".in-h2", 3: ".in-h2", 4: ".in-h2", 5: ".in-end__line" };
  const CAP = 0.185; // cap top below the text box top, as a share of the font size (measured)

  /* ── the rig ───────────────────────────────────────────── */
  const LEG = 13; // thigh = shin, in scene units
  const rig = () => {
    const g = el("g", {}, crewG);
    const chute = el("g", { class: "sc-chute in-run-chute" }, g);
    el("path", { d: "M-6 -50 L-38 -118 M6 -50 L38 -118 M0 -50 L0 -124" }, chute);
    const canopy = el("g", {}, chute);
    el("path", { d: "M-44 -116 Q-44 -158 0 -160 Q44 -158 44 -116 Q33 -125 22 -116 Q11 -125 0 -116 Q-11 -125 -22 -116 Q-33 -125 -44 -116 Z", class: "sc-canopy" }, canopy);
    el("path", { d: "M-11 -159 Q0 -160 11 -159 L9 -119 Q0 -125 -9 -119 Z", class: "sc-canopy__panel" }, canopy);
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
      g, chute, canopy,
      pose(p) {
        bob.setAttribute("transform", `translate(0 ${(p.bob || 0).toFixed(2)}) rotate(${(p.lean || 0).toFixed(1)} 0 -25)`);
        rot(aL[0], p.uaL); rot(aL[1], p.faL); rot(aR[0], p.uaR); rot(aR[1], p.faR);
        rot(lL[0], p.thL); rot(lL[1], p.shL); rot(lR[0], p.thR); rot(lR[1], p.shR);
        rot(headR, p.head);
      },
      place(x, y, s, a = 0) { g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(4)}) rotate(${a.toFixed(2)} 0 -130)`); },
    };
  };

  const STAND = { bob: 0, lean: 0, head: 0, uaL: 8, faL: 0, uaR: -8, faR: 0, thL: 0, shL: 0, thR: 0, shR: 0 };
  const crouch = (k) => ({ bob: 7 * k, lean: 0, head: 0, uaL: 8 + 34 * k, faL: -24 * k, uaR: -8 - 34 * k, faR: 24 * k, thL: 30 * k, shL: -58 * k, thR: -30 * k, shR: 58 * k });
  const tuck = { bob: 1, lean: 0, head: 0, uaL: 140, faL: 30, uaR: -140, faR: -30, thL: 46, shL: -84, thR: 30, shR: -60 };
  const mix = (a, b, t) => { const o = {}; for (const k in a) o[k] = a[k] + ((b[k] || 0) - a[k]) * t; return o; };
  const smooth = (t) => t * t * (3 - 2 * t);

  /* the gait. phase φ runs 0..2π per stride (two steps). d = +1 walking left
     (screen), -1 walking right. A leg swings forward while its foot is up
     (knee folding back), then carries the body while planted (straight). */
  const AMP = 24; // thigh swing, degrees
  const STRIDE = 2 * 2 * LEG * Math.sin(AMP * Math.PI / 180); // scene units per full cycle
  const gait = (φ, d) => {
    const legAt = (p) => {
      const th = AMP * Math.sin(p);
      const swing = Math.cos(p) > 0; // thigh moving forward = foot in the air
      const knee = swing ? -52 * Math.sin(Math.max(0, Math.min(Math.PI, p + Math.PI / 2))) : -6;
      return [th * d, knee * d];
    };
    const [thL, shL] = legAt(φ), [thR, shR] = legAt(φ + Math.PI);
    const arm = (p) => -AMP * 0.9 * Math.sin(p);
    return {
      bob: -2.6 * Math.abs(Math.cos(φ)) + 1.3, lean: -3 * d, head: 2 * Math.sin(2 * φ),
      uaL: 8 + arm(φ) * d, faL: 18 * d, uaR: -8 + arm(φ + Math.PI) * d, faR: 18 * d,
      thL, shL, thR, shR,
    };
  };

  /* ── where he goes ─────────────────────────────────────── */
  // the heading's words, each with the y of its cap tops
  const words = (root) => {
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
        if (r.width > 4) out.push({ l: r.left + 2, r: r.right - 2, y: r.top + CAP * fs, line: Math.round(r.top) });
      }
    }
    const lines = [];
    out.forEach((w) => { let L = lines.find((x) => Math.abs(x.key - w.line) < 6); if (!L) lines.push((L = { key: w.line, ws: [] })); L.ws.push(w); });
    lines.forEach((L) => L.ws.sort((a, b) => a.l - b.l));
    return lines.sort((a, b) => a.key - b.key).map((L) => L.ws);
  };

  const plan = (sec, step, target) => {
    const head = sec.querySelector(HEAD[step]);
    const lines = head ? words(head) : [];
    const pts = [];
    if (!lines.length) { pts.push({ t: "start", x: innerWidth / 2, y: -40 }, { t: "drop", target }); return pts; }
    // parachute onto the end of the first line, then walk the lines boustrophedon:
    // right to left on the first, hop down, left to right on the next…
    const first = lines[0], lastW = first[first.length - 1];
    const lx = lastW.r - 12;
    pts.push({ t: "start", x: lx + 110, y: -60 });
    pts.push({ t: "chute", x: lx, y: lastW.y });
    pts.push({ t: "pack" });
    // the first line end to end, word by word, hopping the gaps (right to left)
    [...first].reverse().forEach((w, wi) => {
      if (wi) pts.push({ t: "hop", x: w.r - 8, y: w.y });
      pts.push({ t: "walk", x: w.l + 8, y: w.y });
    });
    // a hop down onto the next line, then down into the yard
    const second = lines[1];
    if (second && second.length) {
      const w = second[0];
      pts.push({ t: "hop", x: w.l + 10, y: w.y });
    }
    pts.push({ t: "drop", target });
    return pts;
  };

  /* ── the trip ──────────────────────────────────────────── */
  let run = null;
  const launch = (man, sec, step) => {
    const svg = host.querySelector("svg");
    const scale = svg.getScreenCTM().a; // px per scene unit: the yard's own size
    const steps = plan(sec, step, man);
    const r = rig();
    man.style.opacity = "0";
    const feet = (m) => { const b = m.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.bottom }; };
    let k = 1, t0 = 0, last = 0, raf = 0, dead = false, φ = 0, from = { x: steps[0].x, y: steps[0].y };
    const speed = 72; // scene units a second: a brisk walk
    const frame = (now) => {
      if (dead) return;
      if (!t0) { t0 = now; last = now; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const s = steps[k];
      if (!s) return finish();
      const tgt = s.t === "drop" ? feet(s.target) : s;
      const e = (now - t0) / 1000;
      if (s.t === "chute") {
        const dur = 2.8, u = Math.min(1, e / dur), v = 1 - Math.pow(1 - u, 2.2);
        const swing = Math.sin(e * 2.0) * 9 * (1 - u * 0.75);
        r.chute.style.opacity = "1";
        r.canopy.setAttribute("transform", `scale(${(1 + Math.sin(e * 3.1) * 0.03).toFixed(3)} 1)`);
        r.place(from.x + (tgt.x - from.x) * v + Math.sin(e * 1.1) * 12 * (1 - u), from.y + (tgt.y - from.y) * v, scale, swing);
        const fl = Math.max(0, (u - 0.86) / 0.14);
        r.pose({ bob: 0, lean: 0, head: -4 * Math.sin(e * 2.0), uaL: 160 - fl * 18, faL: 6, uaR: -160 + fl * 18, faR: -6,
          thL: 7 * Math.sin(e * 2.4) - fl * 26, shL: 12 + fl * 34, thR: -7 * Math.sin(e * 2.4 + 0.7) + fl * 18, shR: -12 - fl * 26 });
        if (u >= 1) { from = { x: tgt.x, y: tgt.y }; k++; t0 = now; }
      } else if (s.t === "pack") {
        const d = 1.1, f = Math.min(1, e / 0.8);
        r.place(from.x, from.y, scale, 0);
        // knees give, he straightens, glances back at the canopy as it falls away
        const p = e < 0.35 ? mix(STAND, crouch(1), smooth(e / 0.35)) : e < 0.8 ? mix(crouch(1), STAND, smooth((e - 0.35) / 0.45)) : { ...STAND };
        p.head = e > 0.8 ? 14 * Math.sin(Math.min(1, (e - 0.8) / 0.8) * Math.PI) : 0;
        r.pose(p);
        r.canopy.setAttribute("transform", `translate(${(f * 46).toFixed(1)} ${(f * 112).toFixed(1)}) scale(${(1 - f * 0.2).toFixed(3)} ${(1 - f * 0.86).toFixed(3)})`);
        r.chute.style.opacity = String(1 - smooth(f));
        if (e >= d) { r.chute.style.display = "none"; k++; t0 = now; φ = 0; }
      } else if (s.t === "walk") {
        // he moves exactly as far as his feet do: speed follows the stride
        const dir = tgt.x < from.x ? 1 : -1;
        const dist = Math.abs(tgt.x - from.x);
        const pxPerRad = (STRIDE * scale) / (2 * Math.PI);
        φ += (speed * scale * dt) / pxPerRad;
        const done = Math.min(dist, φ * pxPerRad);
        const ramp = Math.min(1, e / 0.25); // starts from standing
        r.place(from.x - dir * done, from.y, scale, 0);
        r.pose(mix(STAND, gait(φ, dir), ramp));
        if (done >= dist) { from = { x: tgt.x, y: tgt.y }; k++; t0 = now; φ = 0; }
      } else { // hop / drop: gather, spring, arc, land and absorb
        const dist = Math.hypot(tgt.x - from.x, tgt.y - from.y);
        const pre = 0.28, air = Math.min(1.3, 0.5 + dist / (420 * Math.max(0.5, scale))), post = 0.32;
        if (e < pre) { r.place(from.x, from.y, scale, 0); r.pose(mix(STAND, crouch(0.9), smooth(e / pre))); }
        else if (e < pre + air) {
          const u = (e - pre) / air;
          const apex = Math.min(from.y, tgt.y) - 34 * scale - dist * 0.1;
          const y = (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * apex + u * u * tgt.y;
          const dirx = tgt.x < from.x ? 1 : -1;
          r.place(from.x + (tgt.x - from.x) * u, y, scale, 0);
          const p = u < 0.45 ? mix(crouch(0.9), tuck, smooth(u / 0.45)) : mix(tuck, crouch(0.7), smooth((u - 0.45) / 0.55));
          p.lean = -6 * dirx * Math.sin(u * Math.PI);
          r.pose(p);
        } else if (e < pre + air + post) { r.place(tgt.x, tgt.y, scale, 0); r.pose(mix(crouch(0.8), STAND, smooth((e - pre - air) / post))); }
        else { from = { x: tgt.x, y: tgt.y }; k++; t0 = now; φ = 0; if (s.t === "drop") return finish(); }
      }
      raf = requestAnimationFrame(frame);
    };
    const finish = () => {
      dead = true;
      man.style.transition = "opacity .2s"; man.style.opacity = "";
      r.g.style.transition = "opacity .2s"; r.g.style.opacity = "0";
      setTimeout(() => { r.g.remove(); man.style.transition = ""; }, 250);
    };
    raf = requestAnimationFrame(frame);
    return { stop() { cancelAnimationFrame(raf); if (!dead) { dead = true; r.g.remove(); man.style.opacity = ""; } } };
  };

  // wait for the page to stop moving, then send him over it
  let settle = 0;
  host.addEventListener("scene:show", (e) => {
    if (run) { run.stop(); run = null; }
    clearTimeout(settle);
    const layer = e.detail.layer, step = layer.dataset.for;
    const sec = document.querySelector(`.in-sec[data-step="${step}"]`);
    const man = layer.querySelector(WHO[step]);
    if (!man || !sec) return;
    man.style.opacity = "0";
    let lastY = -1;
    const wait = () => {
      if (Math.abs(scrollY - lastY) > 0.5) { lastY = scrollY; settle = setTimeout(wait, 140); return; }
      if (wrap.dataset.step !== step) { man.style.opacity = ""; return; }
      run = launch(man, sec, step);
    };
    settle = setTimeout(wait, 200);
  });
})();
