/* The assembly scene behind variants E and F: one loop that tells a story.

     01 DELIVER  two fitters lift a beam off the stack, carry it to the
                 crane, set it down on dunnage and walk back empty
     02 LIFT     the gantry's trolley runs over, lowers the hook and lifts it
     03 SET      it carries the beam to the block and lowers it into place
                 while the rigger guides it in
     04 WELD     the welder runs the seam; the beam stays on the block

   Nobody vanishes. The loop closes on two hand-offs that overlap exactly:
   the carried beam rises from the top of the stack (which keeps its top
   beam), and each new beam lands on the block exactly where the last one
   lies. Everything is one 30-second CSS timeline (transform/opacity only),
   stopped under reduced motion. */
(() => {
  "use strict";
  const host = document.querySelector("[data-scene]");
  if (!host) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  const svg = el("svg", { viewBox: "0 0 1600 420", preserveAspectRatio: "xMidYMax meet" }, host);
  const shared = el("g", { class: "sc-ink" }, svg); // the ground, under every screen
  const L0 = el("g", { class: "sc-layer is-on", "data-for": "0" }, svg); // the yard: the hero's story
  const ink = el("g", { class: "sc-ink" }, L0);
  const props = el("g", { class: "sc-props" }, L0); // beams that move: drawn in ink, above the structure
  const crew = el("g", { class: "sc-crew" }, L0);
  const G = 400; // ground line
  const beam = (x, y, len, parent, cls = "sc-beam") => el("path", { d: `M${x} ${y}h${len} M${x} ${y + 6}h${len} M${x} ${y}v6 M${x + len} ${y}v6`, class: cls }, parent);

  /* ── structure ─────────────────────────────────────────── */
  // the ground runs past the drawing both ways, so a scaled-down scene still meets the screen edges
  el("line", { x1: -1600, y1: G, x2: 3200, y2: G, class: "sc-ground" }, shared);
  for (let x = -1600; x < 3200; x += 14) el("line", { x1: x, y1: G + 2, x2: x - 10, y2: G + 12, class: "sc-hatch" }, shared);

  // hull block on stands
  const bx = 170, bw = 230, by = 322, bh = 58, dx = 40, dy = -30;
  el("path", { d: `M${bx} ${by}h${bw}v${bh}h${-bw}Z M${bx} ${by}l${dx} ${dy}h${bw}l${-dx} ${-dy} M${bx + bw} ${by}l${dx} ${dy}v${bh}l${-dx} ${-dy}` }, ink);
  for (let x = bx + 30; x < bx + bw; x += 30) {
    el("line", { x1: x, y1: by, x2: x, y2: by + bh, class: "sc-rib" }, ink);
    el("line", { x1: x, y1: by, x2: x + dx, y2: by + dy, class: "sc-rib" }, ink);
  }
  [bx + 12, bx + bw - 52].forEach((x) => el("path", { d: `M${x} ${by + bh}l8 ${G - by - bh} M${x + 40} ${by + bh}l-8 ${G - by - bh} M${x + 2} ${G - 6}h36` }, ink));

  // scaffold with the welder's platform, right of the block
  const sx = bx + bw + 14, PL = 348;
  [sx, sx + 60].forEach((x) => el("line", { x1: x, y1: G, x2: x, y2: 282 }, ink));
  [PL, 376, 304].forEach((y) => el("line", { x1: sx - 4, y1: y, x2: sx + 64, y2: y }, ink));
  el("path", { d: `M${sx} ${G}L${sx + 60} ${PL} M${sx} ${PL}L${sx + 60} 282`, class: "sc-rib" }, ink);
  el("rect", { x: sx - 4, y: PL, width: 68, height: 4 }, ink);

  // gantry crane over the block and the set-down area
  const c1 = 120, c2 = 720, top = 196;
  el("path", { d: `M${c1} ${G}L${c1 + 12} ${top} M${c1 + 30} ${G}L${c1 + 18} ${top} M${c2} ${G}L${c2 - 12} ${top} M${c2 - 30} ${G}L${c2 - 18} ${top} M${c1 + 2} ${G - 90}h28 M${c2 - 30} ${G - 90}h28` }, ink);
  el("path", { d: `M${c1 - 8} ${top}H${c2 + 8} M${c1 - 8} ${top + 14}H${c2 + 8} M${c1 - 8} ${top}v14 M${c2 + 8} ${top}v14` }, ink);
  for (let x = c1; x < c2; x += 24) el("line", { x1: x, y1: top, x2: x + 12, y2: top + 14, class: "sc-rib" }, ink);

  // set-down area: dunnage under the crane
  const BX = 590; // its centre
  [BX - 44, BX + 32].forEach((x) => el("rect", { x, y: G - 6, width: 12, height: 6 }, ink));

  // the stack the beams come from
  const AX = 1360; // its centre
  for (let i = 0; i < 4; i++) beam(AX - 60, G - 8 - i * 10, 120, ink, "sc-stack");

  /* ── the moving beams ──────────────────────────────────── */
  // 1. the carried beam: starts as the top of the stack, ends on the dunnage
  beam(AX - 60, G - 38, 120, props, "sc-beam sc-beam--carried");
  // 2. the crane: trolley, cable, hook and the beam it carries
  const TX = bx + dx / 2 + bw / 2; // over the middle of the block's top face
  const hoist = el("g", { class: "sc-trolley" }, props);
  el("rect", { x: TX - 20, y: top + 14, width: 40, height: 12, class: "sc-ink-line" }, hoist);
  el("line", { x1: TX, y1: top + 26, x2: TX, y2: top + 56, class: "sc-cable sc-ink-line", style: `transform-origin: ${TX}px ${top + 26}px` }, hoist);
  const hook = el("g", { class: "sc-hook" }, hoist);
  el("path", { d: `M${TX} ${top + 56}l-5 6h10Z M${TX - 4} ${top + 62}L${TX - 56} ${top + 74} M${TX + 4} ${top + 62}L${TX + 56} ${top + 74}`, class: "sc-ink-line" }, hook);
  beam(TX - 60, top + 74, 120, hook, "sc-beam sc-beam--hung");
  // 3. the beam on the block: shown from the first landing on, for good
  beam(TX - 60, by + dy + 8, 120, props, "sc-beam sc-beam--placed");

  /* ── the story strip ───────────────────────────────────── */
  const steps = el("g", { class: "sc-steps" }, L0);
  ["Deliver", "Lift", "Set", "Weld"].forEach((t, i) => {
    el("text", { x: 110 + i * 112, y: 186, class: `sc-step sc-step--${i + 1}` }, steps).textContent = `0${i + 1} ${t.toUpperCase()}`;
  });

  /* ── people ─────────────────────────────────────────────
     Solid silhouettes with knees and elbows. Every joint is a group whose
     origin is the joint, so rotate() turns the limb about it. Poses are
     tracks on the same 30 s timeline as the story, generated below. */
  const person = (x, y, { armL = 8, armR = -8, cls = "" } = {}, parent = crew) => {
    const g = el("g", { class: "sc-man " + cls, transform: `translate(${x} ${y})` }, parent);
    const bob = el("g", { class: "sc-bob sc-tl" }, g);
    const joint = (parentEl, jx, jy, ang, name) => {
      const j = el("g", { transform: `translate(${jx} ${jy})` }, parentEl);
      return el("g", { class: name + " sc-tl", style: `--a:${ang}deg` }, j);
    };
    const seg = (parentEl, len) => el("line", { x1: 0, y1: 0, x2: 0, y2: len }, parentEl);
    const arm = (side, ang) => {
      const up = joint(bob, 0, -48, ang, `sc-arm sc-arm--${side}`); seg(up, 11);
      const fore = joint(up, 0, 11, 0, `sc-fore sc-arm--${side}`); seg(fore, 11);
      return { up, fore };
    };
    const leg = (side, hx) => {
      const th = joint(bob, hx, -25, 0, `sc-leg sc-leg--${side}`); seg(th, 13);
      const sh = joint(th, 0, 13, 0, `sc-shin sc-leg--${side}`); seg(sh, 13);
      return { th, sh };
    };
    const aL = arm("l", armL);
    const lL = leg("l", -2), lR = leg("r", 2);
    el("rect", { x: -7, y: -54, width: 14, height: 31, rx: 4, class: "sc-body" }, bob);
    el("line", { x1: -7, y1: -40, x2: 7, y2: -40, class: "sc-band" }, bob);
    el("line", { x1: -7, y1: -33, x2: 7, y2: -33, class: "sc-band" }, bob);
    const aR = arm("r", armR);
    const head = joint(bob, 0, -54, 0, "sc-headg");
    el("circle", { cx: 0, cy: -7, r: 6, class: "sc-head" }, head);
    el("path", { d: "M-7.5 -8 A7.5 7.5 0 0 1 7.5 -8 Z M-10 -8 H10", class: "sc-helmet" }, head);
    return { g, bob, head, aL, aR, lL, lR };
  };

  /* tracks: [percent, value] pairs → @keyframes, assigned by animation-name */
  const sheet = [];
  let uid = 0;
  const track = (node, kind, frames, opts = {}) => {
    const name = `sc-k${uid++}`;
    const fmt = kind === "r" ? (v) => `transform: rotate(${v}deg)` : kind === "y" ? (v) => `transform: translateY(${v}px)` : kind === "x" ? (v) => `transform: translateX(${v}px)` : (v) => `opacity: ${v}`;
    const tf = opts.lin ? "linear" : "cubic-bezier(0.45, 0, 0.55, 1)";
    const seen = new Map();
    frames.forEach(([p, v]) => seen.set(Math.max(0, Math.min(100, +p.toFixed(2))), v));
    if (!seen.has(0)) seen.set(0, frames[0][1]);
    if (!seen.has(100)) seen.set(100, seen.get(0));
    const body = [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([p, v]) => `${p}% { ${fmt(v)}; animation-timing-function: ${tf}; }`).join(" ");
    sheet.push(`@keyframes ${name} { ${body} }`);
    node.style.animationName = name;
    if (opts.delay) node.style.animationDelay = `${opts.delay}s`;
    node.classList.add("sc-tl");
  };
  const merge = (...lists) => lists.flat();
  const hold = (a, b, v) => [[a, v], [b, v]];

  /* a walk: stride every 0.75 % (0.225 s), knee bending on the back leg, body
     rising as the legs pass; dir +1 walks left, -1 walks right */
  const walk = (a, b, dir, phase, armsSwing, st = 0.75) => {
    const out = { thL: [], shL: [], thR: [], shR: [], bob: [], uaL: [], faL: [], uaR: [], faR: [] };
    let i = phase;
    for (let t = a; t <= b - st; t += st, i++) {
      const s = i % 2 ? 1 : -1; // which leg leads
      const m = t + st / 2;
      out.thL.push([t, 20 * s * dir], [m, 0]); out.thR.push([t, -20 * s * dir], [m, 0]);
      out.shL.push([t, s < 0 ? -26 * dir : 0], [m, -34 * dir * (s > 0 ? 1 : 0)]);
      out.shR.push([t, s > 0 ? -26 * dir : 0], [m, -34 * dir * (s < 0 ? 1 : 0)]);
      out.bob.push([t, 0], [m, -2.4]);
      if (armsSwing) {
        out.uaL.push([t, 8 - 18 * s * dir]); out.uaR.push([t, -8 + 18 * s * dir]);
        out.faL.push([t, 18 * dir]); out.faR.push([t, 18 * dir]);
      }
    }
    Object.values(out).forEach((l) => l.length && l.push([b, 0]));
    if (armsSwing) { out.uaL[out.uaL.length - 1] = [b, 8]; out.uaR[out.uaR.length - 1] = [b, -8]; }
    return out;
  };

  // welder on the scaffold, torch to the block's corner seam
  const wx = sx + 20;
  const w = person(wx, PL, { armL: 30, armR: 20, cls: "sc-welder" });
  el("line", { x1: 0, y1: 11, x2: 0, y2: 18, class: "sc-tool" }, w.aR.fore);
  const visor = el("rect", { x: -6.5, y: -12, width: 13, height: 9, rx: 2, class: "sc-visor" }, w.head);
  const tip = [wx - 29 * Math.sin(80 * Math.PI / 180), PL - 48 + 29 * Math.cos(80 * Math.PI / 180)];
  const sparks = el("g", { class: "sc-sparks", transform: `translate(${tip[0].toFixed(1)} ${tip[1].toFixed(1)})` }, crew);
  const sparkWin = el("g", { class: "sc-weldwin" }, sparks);
  for (let i = 0; i < 10; i++) el("line", { x1: 0, y1: 0, x2: 6, y2: 0, class: "sc-spark", style: `--r:${-160 + i * 20}deg; --d:${(i * 0.11).toFixed(2)}s` }, sparkWin);
  el("circle", { cx: 0, cy: 0, r: 4, class: "sc-glow" }, sparkWin);
  {
    const jit = []; for (let t = 76; t < 94; t += 0.6) jit.push([t, 78 + (Math.round(t / 0.6) % 2 ? 4 : 0)]);
    track(w.aR.up, "r", merge(hold(0, 72, 20), [[75, 80]], jit, [[94, 80], [96.5, 20]]));
    track(w.aR.fore, "r", merge(hold(0, 72, 14), [[75, 0], [94, 0], [96.5, 14]]));
    track(w.aL.up, "r", merge(hold(0, 72, 30), [[75, 58], [94, 58], [96.5, 30]]));
    track(w.aL.fore, "r", merge(hold(0, 72, -40), [[75, -10], [94, -10], [96.5, -40]]));
    track(w.head, "r", [[0, 0], [8, 0], [12, -14], [30, -14], [36, 0], [42, 0], [46, 14], [60, 14], [64, -10], [70, -10], [73, 0], [96, 0], [100, 0]]);
    const breathe = []; for (let t = 0; t < 72; t += 4) breathe.push([t, 0], [t + 2, -0.8]);
    track(w.bob, "y", merge(breathe, [[72, 0], [75, 2.5]], (() => { const o = []; for (let t = 76; t < 94; t += 1.2) o.push([t, 2.5], [t + 0.6, 3]); return o; })(), [[94, 2.5], [96.5, 0]]));
    track(visor, "o", [[0, 0], [73.5, 0], [75, 1], [94, 1], [95.5, 0], [100, 0]]);
  }

  // rigger outside the right leg: hand signals to the crane driver
  const rig = person(c2 + 40, G, { cls: "sc-rigger" });
  {
    const wave = []; for (let t = 46; t < 56; t += 1.25) wave.push([t, 10], [t + 0.62, -45]);
    const lower = []; for (let t = 66; t < 73.5; t += 1.25) lower.push([t, 20], [t + 0.62, 40]);
    const lowerR = lower.map(([t, v]) => [t, -v]);
    track(rig.aL.up, "r", merge(hold(0, 40, 8), [[43, 150]], [[56, 150], [58, 95], [65, 95], [66.5, 75], [73.5, 75], [75, 8], [100, 8]]));
    track(rig.aL.fore, "r", merge(hold(0, 43, 0), wave, [[56, 0], [65, 0]], lower, [[73.5, 0], [100, 0]]));
    track(rig.aR.up, "r", merge(hold(0, 65, -8), [[66.5, -75], [73.5, -75], [75, -150], [79, -150], [81, -8], [100, -8]]));
    track(rig.aR.fore, "r", merge(hold(0, 66, 0), lowerR, [[73.5, 0], [75, -30], [79, -30], [81, 0], [100, 0]]));
    track(rig.head, "r", [[0, 0], [6, 12], [30, 12], [36, 0], [40, 0], [43, -10], [72, -10], [76, 0], [100, 0]]);
    const breathe = []; for (let t = 0; t < 100; t += 4) breathe.push([t, 0], [t + 2, -0.8]);
    track(rig.bob, "y", breathe);
  }

  // the two fitters: start at the stack, a beam end each
  const carry = el("g", { class: "sc-carry" }, crew);
  const pair = [AX - 50, AX + 50].map((x, i) => person(x, G, { cls: "sc-walker" + (i ? " sc-walker--b" : "") }, carry));
  pair.forEach((m, i) => {
    const go = walk(4, 32, 1, i, false), back = walk(40, 68, -1, i + 1, true);
    const squat = (a, b) => ({ bob: [[a, 0], [a + 1, 7], [b - 1, 7], [b, 0]], thL: [[a, 0], [a + 1, 28], [b - 1, 28], [b, 0]], thR: [[a, 0], [a + 1, -28], [b - 1, -28], [b, 0]], shL: [[a, 0], [a + 1, -56], [b - 1, -56], [b, 0]], shR: [[a, 0], [a + 1, 56], [b - 1, 56], [b, 0]] });
    const s1 = squat(0, 3.2), s2 = squat(33, 37.5);
    track(m.bob, "y", merge(s1.bob, [[4, 0]], go.bob, [[32, 0]], s2.bob, [[40, 0]], back.bob, (() => { const o = []; for (let t = 69; t < 98; t += 4) o.push([t, 0], [t + 2, -0.8]); return o; })(), [[100, 0]]));
    ["L", "R"].forEach((S) => {
      track(m[`l${S}`].th, "r", merge(s1[`th${S}`], [[4, 0]], go[`th${S}`], [[32, 0]], s2[`th${S}`], [[40, 0]], back[`th${S}`], [[68, 0], [100, 0]]));
      track(m[`l${S}`].sh, "r", merge(s1[`sh${S}`], [[4, 0]], go[`sh${S}`], [[32, 0]], s2[`sh${S}`], [[40, 0]], back[`sh${S}`], [[68, 0], [100, 0]]));
    });
    // arms: reach down in the squat, overhead while carrying, down to set the beam,
    // swinging on the way back, then each his own idle at the stack
    const idleA = { uaL: [[70, 8], [72, 38], [95, 38], [97, 8]], faL: [[70, 0], [72, -80], [95, -80], [97, 0]], uaR: [[70, -8], [72, -38], [95, -38], [97, -8]], faR: [[70, 0], [72, 80], [95, 80], [97, 0]] };
    const wipe = []; for (let t = 76; t < 80; t += 1) wipe.push([t, -50], [t + 0.5, -80]);
    const idleB = { uaL: [[70, 8], [97, 8]], faL: [[70, 0], [97, 0]], uaR: [[70, -8], [73, -150], [80, -150], [82, -8], [97, -8]], faR: [[70, 0], [73, -50], ...wipe, [80, -50], [82, 0], [97, 0]] };
    const idle = i ? idleB : idleA;
    const up = { L: 172, R: 188 }, down = { L: 8, R: -8 }, reach = { L: 22, R: -22 };
    ["L", "R"].forEach((S) => {
      track(m[`a${S}`].up, "r", merge([[0, down[S]], [1, reach[S]], [3.2, up[S]], [32, up[S]], [34, 100 * (S === "L" ? 1 : -1)], [36.5, reach[S]], [38, down[S]], [40, down[S]]], back[`ua${S}`], [[68, down[S]]], idle[`ua${S}`], [[100, down[S]]]));
      track(m[`a${S}`].fore, "r", merge([[0, 0], [32, 0], [34, (S === "L" ? 30 : -30)], [36.5, 0], [40, 0]], back[`fa${S}`], [[68, 0]], idle[`fa${S}`], [[100, 0]]));
    });
    track(m.head, "r", i ? [[0, 0], [84, 0], [86, 12], [89, 12], [91, -12], [94, -12], [96, 0], [100, 0]] : [[0, 0], [100, 0]]);
  });

  /* ── the other screens: one scene each ───────────────────────────────
     Each is a layer over the shared ground, shown while its section is in
     view. Same rig and track() as the yard, each on its own loop (--T). */
  const layer = (step, T) => el("g", { class: "sc-layer", "data-for": step, style: `--T:${T}s` }, svg);
  const label = (x, t, parent) => { el("text", { x, y: 214, class: "sc-label" }, parent).textContent = t; };
  const inkG = (parent) => el("g", { class: "sc-ink" }, parent);
  const crewG = (parent) => el("g", { class: "sc-crew" }, parent);
  const sparksAt = (x, y, parent, cls = "") => {
    const g = el("g", { class: "sc-sparks " + cls, transform: `translate(${x} ${y})` }, parent);
    for (let i = 0; i < 10; i++) el("line", { x1: 0, y1: 0, x2: 6, y2: 0, class: "sc-spark", style: `--r:${-160 + i * 20}deg; --d:${(i * 0.11).toFixed(2)}s` }, g);
    el("circle", { cx: 0, cy: 0, r: 4, class: "sc-glow" }, g);
    return g;
  };
  const breathe = (m, step = 4) => { const o = []; for (let t = 0; t < 100; t += step) o.push([t, 0], [t + step / 2, -0.8]); track(m.bob, "y", o); };

  /* 01 SERVICES — three trades at work: welding, scaffolding, electrical */
  {
    const L = layer(1, 12), ink2 = inkG(L), cr = crewG(L);
    // welding: a steel frame, the welder at its seam
    el("path", { d: "M360 400V250 M392 400V250 M352 250h48 M352 400h48 M392 300h86 M392 312h86 M478 300v12" }, ink2);
    const w2 = person(512, G, { cls: "sc-welder" }, cr);
    el("rect", { x: -6.5, y: -12, width: 13, height: 9, rx: 2, class: "sc-visor sc-visor--on" }, w2.head);
    el("line", { x1: 0, y1: 11, x2: 0, y2: 18, class: "sc-tool" }, w2.aR.fore);
    const jit = []; for (let t = 0; t < 100; t += 2) jit.push([t, 84 + (Math.round(t / 2) % 2 ? 5 : 0)]);
    track(w2.aR.up, "r", jit); track(w2.aR.fore, "r", [[0, 6], [50, 0], [100, 6]]);
    track(w2.aL.up, "r", [[0, 40], [100, 40]]); track(w2.aL.fore, "r", [[0, -50], [100, -50]]);
    track(w2.head, "r", [[0, 10], [100, 10]]);
    sparksAt(482, 306, cr);
    label(420, "WELDING", L);
    // scaffolding: a tower with a ladder, a scaffolder climbing it and back
    el("path", { d: "M740 400V230 M860 400V230 M736 230h128 M736 300h128 M736 350h128 M740 400L860 300 M740 300L860 230" }, ink2);
    for (let y = 392; y > 232; y -= 14) el("line", { x1: 778, y1: y, x2: 802, y2: y, class: "sc-rib" }, ink2);
    el("path", { d: "M778 400V226 M802 400V226" }, ink2);
    const climb = el("g", {}, cr);
    const sc = person(790, G, { cls: "sc-climber" }, climb);
    track(climb, "y", [[0, 0], [8, 0], [42, -118], [58, -118], [92, 0], [100, 0]], { lin: true });
    const rung = (a, b, base, amp) => { const o = []; let k = 0; for (let t = a; t < b; t += 2.5, k++) o.push([t, base + (k % 2 ? amp : -amp)]); o.push([b, base]); return o; };
    track(sc.aL.up, "r", merge([[0, 8], [6, 170]], rung(8, 42, 165, 14), [[46, 150], [54, 150]], rung(58, 92, 165, 14), [[96, 8], [100, 8]]));
    track(sc.aR.up, "r", merge([[0, -8], [6, 190]], rung(8, 42, 195, -14), [[46, 210], [54, 210]], rung(58, 92, 195, -14), [[96, -8], [100, -8]]));
    track(sc.lL.th, "r", merge(rung(8, 42, -20, 20), rung(58, 92, -20, 20), [[100, 0]]));
    track(sc.lL.sh, "r", merge(rung(8, 42, 25, 25), rung(58, 92, 25, 25), [[100, 0]]));
    track(sc.lR.th, "r", merge(rung(8, 42, -20, -20), rung(58, 92, -20, -20), [[100, 0]]));
    track(sc.lR.sh, "r", merge(rung(8, 42, 25, -25), rung(58, 92, 25, -25), [[100, 0]]));
    track(sc.head, "r", [[0, 0], [46, -12], [54, 12], [58, 0], [100, 0]]);
    label(800, "SCAFFOLDING", L);
    // electrical: a cabinet with indicator lights, the electrician at work
    el("path", { d: "M1120 400V286h84v114 M1120 300h84 M1162 300v100 M1204 360h40 Q1290 360 1300 400" }, ink2);
    [0, 1, 2].forEach((i) => el("rect", { x: 1132 + i * 14, y: 290, width: 8, height: 6, class: "sc-led", style: `--d:${i * 0.4}s` }, L));
    const e = person(1240, G, { cls: "sc-sparky" }, cr);
    track(e.aR.up, "r", [[0, 82], [100, 82]]);
    const twist = []; for (let t = 0; t < 100; t += 3) twist.push([t, Math.round(t / 3) % 2 ? 18 : -10]);
    track(e.aR.fore, "r", twist);
    el("line", { x1: 0, y1: 11, x2: 0, y2: 19, class: "sc-tool" }, e.aR.fore);
    track(e.head, "r", [[0, 8], [40, 8], [46, -10], [60, -10], [66, 8], [100, 8]]);
    breathe(e, 5);
    label(1180, "ELECTRICAL", L);
  }

  /* 02 PROJECTS — a hull in dry dock: painters on a cradle, an inspector on his rounds */
  {
    const L = layer(2, 16), ink2 = inkG(L), cr = crewG(L);
    el("path", { d: "M320 226H1210L1300 200L1262 296Q1232 370 1150 372H420Q352 372 332 324Z" }, ink2);
    el("path", { d: "M340 226V170H470V226 M356 186h20 M386 186h20 M416 186h20 M446 186h20 M400 170V146h14V170", class: "" }, ink2);
    el("line", { x1: 330, y1: 312, x2: 1272, y2: 312, class: "sc-rib sc-dash" }, ink2);
    for (let x = 520; x < 1180; x += 60) el("line", { x1: x, y1: 228, x2: x, y2: 370, class: "sc-rib" }, ink2);
    [460, 640, 820, 1000, 1120].forEach((x) => el("rect", { x: x - 14, y: 372, width: 28, height: 28 }, ink2));
    // the cradle hangs from the deck on two falls and travels down the side
    el("path", { d: "M690 340V176 M850 340V176 M680 176h20 M840 176h20", class: "sc-rib" }, ink2);
    const cradle = el("g", {}, L);
    track(cradle, "y", [[0, 0], [10, 0], [42, 78], [58, 78], [90, 0], [100, 0]]);
    el("path", { d: "M680 250h180 M680 256h180 M690 226V250 M850 226V250", class: "sc-beam" }, cradle);
    const cc = crewG(cradle);
    [735, 805].forEach((x, i) => {
      const pnt = person(x, 250, { cls: "sc-painter" }, cc);
      const roll = []; for (let t = 0; t < 100; t += 4) roll.push([t, (Math.round(t / 4) + i) % 2 ? 150 : 110]);
      track(pnt.aR.up, "r", roll.map(([t, v]) => [t, -v]));
      track(pnt.aR.fore, "r", roll.map(([t, v]) => [t, v > 130 ? -30 : 0]));
      el("path", { d: "M0 11 v10 M-5 21 h10", class: "sc-tool" }, pnt.aR.fore);
      breathe(pnt, 6);
    });
    // the inspector walks the dock floor with a torch, there and back
    const rounds = el("g", {}, cr);
    track(rounds, "x", [[0, 0], [45, 520], [55, 520], [100, 0]], { lin: true });
    const ins = person(470, G, { cls: "sc-inspector" }, rounds);
    const go2 = walk(0, 45, -1, 0, false, 2.6), back2 = walk(55, 100, 1, 1, false, 2.6);
    ["L", "R"].forEach((S) => {
      track(ins[`l${S}`].th, "r", merge(go2[`th${S}`], [[45, 0], [55, 0]], back2[`th${S}`]));
      track(ins[`l${S}`].sh, "r", merge(go2[`sh${S}`], [[45, 0], [55, 0]], back2[`sh${S}`]));
    });
    track(ins.bob, "y", merge(go2.bob, [[45, 0], [55, 0]], back2.bob));
    track(ins.aR.up, "r", [[0, -70], [100, -70]]);
    track(ins.head, "r", [[0, -6], [44, -6], [48, -20], [54, -20], [58, 6], [100, 6]]);
    const beamT = el("path", { d: "M18 -40 L150 -84 L150 -4 Z", class: "sc-torch" }, ins.g);
    track(beamT, "o", [[0, .55], [45, .55], [46, 0], [99, 0], [100, .55]]);
  }

  /* 03 CAREERS — new crew drops in: parachutes land, everyone walks on to the gate */
  {
    const L = layer(3, 15), ink2 = inkG(L), cr = crewG(L);
    el("path", { d: "M1350 400V306 M1410 400V306" }, ink2); // two legs under the sign, none through it
    el("rect", { x: 1300, y: 262, width: 160, height: 44, class: "sc-sign" }, ink2);
    el("text", { x: 1380, y: 290, class: "sc-label sc-label--sign" }, ink2).textContent = "JOIN THE CREW";
    const rec = person(1250, G, { cls: "sc-recruiter" }, cr);
    el("rect", { x: -6, y: 10, width: 12, height: 15, class: "sc-board" }, rec.aR.fore);
    track(rec.aR.up, "r", [[0, -40], [100, -40]]); track(rec.aR.fore, "r", [[0, 70], [100, 70]]);
    const wave = []; for (let t = 0; t < 100; t += 5) wave.push([t, t % 10 ? 150 : 175]);
    track(rec.aL.up, "r", wave);
    track(rec.head, "r", [[0, 10], [100, 10]]);
    [[620, 0], [860, -5], [480, -10]].forEach(([lx, delay], j) => {
      const opts = { delay };
      const drift = el("g", {}, cr);
      // fall 0–40 % with a sway, land, then walk on past the gate and off the sheet
      track(drift, "x", [[0, -40], [14, 30], [28, -20], [40, 0], [46, 0], [100, 1700 - lx]], { ...opts, lin: true });
      const fall = el("g", {}, drift);
      track(fall, "y", [[0, -420], [40, 0], [100, 0]], { ...opts, lin: true });
      const chute = el("g", { class: "sc-chute", transform: `translate(${lx} ${G})` }, fall);
      el("path", { d: "M-6 -50 L-36 -112 M6 -50 L36 -112 M0 -50 L0 -118" }, chute);
      el("path", { d: "M-40 -110 Q-40 -150 0 -152 Q40 -150 40 -110 Q30 -118 20 -110 Q10 -118 0 -110 Q-10 -118 -20 -110 Q-30 -118 -40 -110 Z", class: "sc-canopy" }, chute);
      el("path", { d: "M-10 -151 Q0 -152 10 -151 L8 -113 Q0 -118 -8 -113 Z", class: "sc-canopy__panel" }, chute);
      track(chute, "o", [[0, 1], [40, 1], [44, 0], [99, 0], [100, 1]], opts);
      const m = person(lx, G, { cls: "sc-jumper" }, fall);
      const walkOn = walk(48, 100, -1, j, true, 2.4);
      ["L", "R"].forEach((S) => {
        track(m[`l${S}`].th, "r", merge([[0, S === "L" ? 6 : -6], [39, S === "L" ? 6 : -6], [41, 28 * (S === "L" ? 1 : -1)], [44, 28 * (S === "L" ? 1 : -1)], [47, 0]], walkOn[`th${S}`]), opts);
        track(m[`l${S}`].sh, "r", merge([[0, 0], [39, 0], [41, 50 * (S === "L" ? -1 : 1)], [44, 50 * (S === "L" ? -1 : 1)], [47, 0]], walkOn[`sh${S}`]), opts);
        track(m[`a${S}`].up, "r", merge([[0, S === "L" ? 160 : -160], [40, S === "L" ? 160 : -160], [44, S === "L" ? 30 : -30], [47, S === "L" ? 8 : -8]], walkOn[`ua${S}`]), opts);
        track(m[`a${S}`].fore, "r", merge([[0, 0], [47, 0]], walkOn[`fa${S}`]), opts);
      });
      track(m.bob, "y", merge([[0, 0], [39, 0], [41, 8], [44, 8], [47, 0]], walkOn.bob), opts);
    });
  }

  /* 04 CONTACT — calling out: a megaphone, a wave, a call on the phone */
  {
    const L = layer(4, 8), ink2 = inkG(L), cr = crewG(L);
    const mg = person(520, G, { cls: "sc-caller" }, cr);
    track(mg.aR.up, "r", [[0, -100], [100, -100]]); track(mg.aR.fore, "r", [[0, -20], [100, -20]]);
    el("path", { d: "M-3 11 L-3 20 L-12 30 L12 30 L3 20 L3 11 Z", class: "sc-megaphone" }, mg.aR.fore);
    track(mg.aL.up, "r", [[0, 30], [100, 30]]); track(mg.aL.fore, "r", [[0, -90], [100, -90]]);
    track(mg.head, "r", [[0, -8], [100, -8]]);
    breathe(mg, 6);
    [0, 1, 2].forEach((i) => el("path", { d: `M${560 + i * 18} ${G - 78} q12 14 0 28`, class: "sc-wave", style: `--d:${i * 0.25}s` }, L));
    const wv = person(800, G, { cls: "sc-waver" }, cr);
    const wL = [], wR = []; for (let t = 0; t < 100; t += 6.25) { const k = Math.round(t / 6.25) % 2; wL.push([t, k ? 118 : 140]); wR.push([t, k ? -140 : -118]); }
    track(wv.aL.up, "r", wL); track(wv.aR.up, "r", wR);
    track(wv.aL.fore, "r", wL.map(([t, v]) => [t, v > 130 ? 40 : 10])); track(wv.aR.fore, "r", wR.map(([t, v]) => [t, v < -130 ? -40 : -10]));
    track(wv.bob, "y", (() => { const o = []; for (let t = 0; t < 100; t += 12.5) o.push([t, 0], [t + 6.25, -4]); return o; })());
    // on a crate, on the phone
    el("rect", { x: 1060, y: 362, width: 60, height: 38 }, ink2);
    el("path", { d: "M1060 381h60 M1090 362v38", class: "sc-rib" }, ink2);
    const ph = person(1090, 362 + 18, { cls: "sc-phone" }, cr);
    track(ph.lL.th, "r", [[0, -80], [100, -80]]); track(ph.lR.th, "r", [[0, -80], [100, -80]]);
    track(ph.lL.sh, "r", [[0, 80], [50, 95], [100, 80]]); track(ph.lR.sh, "r", [[0, 95], [50, 80], [100, 95]]);
    track(ph.aR.up, "r", [[0, -150], [100, -150]]); track(ph.aR.fore, "r", [[0, -150], [100, -150]]);
    el("rect", { x: -3, y: 6, width: 6, height: 11, class: "sc-handset" }, ph.aR.fore);
    const talk = []; for (let t = 0; t < 100; t += 10) talk.push([t, 30], [t + 5, 60]);
    track(ph.aL.up, "r", talk);
    track(ph.head, "r", [[0, 8], [30, 8], [36, -6], [64, -6], [70, 8], [100, 8]]);
    [0, 1, 2].forEach((i) => el("circle", { cx: 1112 + i * 9, cy: G - 92, r: 2.5, class: "sc-dot", style: `--d:${i * 0.2}s` }, L));
  }

  /* 05 THE END — lunch on the beam */
  {
    const L = layer(5, 10), ink2 = inkG(L), cr = crewG(L);
    const by2 = 330;
    el("path", { d: `M360 ${by2}H1240 M360 ${by2 + 12}H1240 M360 ${by2}v12 M1240 ${by2}v12` }, ink2);
    [420, 1180].forEach((x) => el("path", { d: `M${x - 30} ${G}L${x} ${by2 + 12}L${x + 30} ${G} M${x - 18} ${G - 24}h36` }, ink2));
    const xs = [500, 640, 780, 920, 1060];
    xs.forEach((x, i) => {
      const s = person(x, by2 + 25, { cls: "sc-luncher" }, cr);
      // seated, side-on: thighs along the beam, shins hanging and swinging
      const sw = []; for (let t = 0; t < 100; t += 12.5) sw.push([t, 0], [t + 6.25, 24]);
      track(s.lL.th, "r", [[0, -84], [100, -84]]); track(s.lR.th, "r", [[0, -78], [100, -78]]);
      track(s.lL.sh, "r", sw.map(([t, v]) => [((t + i * 3) % 100), 84 + v]).sort((a, b) => a[0] - b[0]));
      track(s.lR.sh, "r", sw.map(([t, v]) => [((t + i * 3 + 6) % 100), 78 + 24 - v]).sort((a, b) => a[0] - b[0]));
      breathe(s, 5);
      if (i === 0) { // sandwich
        el("rect", { x: -5, y: 9, width: 10, height: 5, class: "sc-food" }, s.aR.fore);
        track(s.aR.up, "r", [[0, -30], [30, -30], [36, -150], [48, -150], [54, -30], [100, -30]]);
        track(s.aR.fore, "r", [[0, 0], [30, 0], [36, -150], [48, -150], [54, 0], [100, 0]]);
      } else if (i === 1) { // a cup of coffee
        el("rect", { x: -4, y: 12, width: 8, height: 9, class: "sc-food" }, s.aL.fore);
        track(s.aL.up, "r", [[0, 30], [60, 30], [66, 150], [80, 150], [86, 30], [100, 30]]);
        track(s.aL.fore, "r", [[0, 0], [60, 0], [66, 150], [80, 150], [86, 0], [100, 0]]);
      } else if (i === 2) { // the paper
        const paper = el("rect", { x: -22, y: -54, width: 44, height: 26, class: "sc-paper" }, s.bob);
        track(s.aL.up, "r", [[0, 60], [100, 60]]); track(s.aR.up, "r", [[0, -60], [100, -60]]);
        track(s.aL.fore, "r", [[0, 90], [100, 90]]); track(s.aR.fore, "r", [[0, -90], [100, -90]]);
        track(paper, "y", [[0, 0], [48, 0], [50, -3], [52, 0], [100, 0]]);
        track(s.head, "r", [[0, 0], [70, 0], [74, 14], [82, 14], [86, 0], [100, 0]]);
      } else if (i === 3) { // pointing out across the yard
        track(s.aR.up, "r", [[0, -10], [40, -10], [46, -100], [70, -100], [76, -10], [100, -10]]);
        track(s.head, "r", [[0, 0], [40, 0], [46, -14], [70, -14], [76, 0], [100, 0]]);
      } else { // looking where he points
        track(s.head, "r", [[0, 0], [44, 0], [50, -14], [72, -14], [78, 0], [100, 0]]);
        track(s.aL.up, "r", [[0, 40], [100, 40]]); track(s.aL.fore, "r", [[0, -70], [100, -70]]);
      }
    });
    [570, 850].forEach((x) => el("rect", { x, y: by2 - 10, width: 16, height: 10, class: "sc-ink-line" }, ink2));
  }

  /* show the layer for the section in view; the others pause */
  const layers = [...svg.querySelectorAll(".sc-layer")];
  const wrapEl = host.closest(".in-wrap");
  const show = () => {
    const st = (wrapEl && wrapEl.dataset.step) || "0";
    layers.forEach((l) => l.classList.toggle("is-on", l.dataset.for === st));
  };
  if (wrapEl) new MutationObserver(show).observe(wrapEl, { attributes: true, attributeFilter: ["data-step"] });
  show();

  const css = document.createElement("style");
  css.textContent = sheet.join("\n");
  document.head.append(css);

  /* ── fit: the scene always spans the page. It is the headline column
     that makes room: the scene's drawing height (250 units above the
     ground) is published as --scene-h, the column sits above it and the
     headline shrinks only if the space left is short. */
  const wrap = host.closest(".in-wrap");
  const fit = () => {
    if (!wrap) return;
    const svgEl = host.querySelector("svg");
    if (innerWidth < 1100) {
      // phones: a fixed strip, cropped round the middle of the drawing
      svgEl.setAttribute("preserveAspectRatio", "xMidYMax slice");
      host.style.height = "150px";
      wrap.style.setProperty("--scene-h", "100px");
      wrap.style.removeProperty("--h1-fit");
      return;
    }
    svgEl.setAttribute("preserveAspectRatio", "xMidYMax meet");
    const k = Math.min(innerWidth / 1600, 1.15);
    host.style.height = 420 * k + "px";
    const sceneH = 250 * k + 20;
    wrap.style.setProperty("--scene-h", sceneH + "px");
    const paths = wrap.querySelector(".in-paths");
    const room = innerHeight - 72 - sceneH - paths.offsetHeight - 48 - 24;
    wrap.style.setProperty("--h1-fit", Math.max(28, room / 2.85) + "px");
  };
  if (wrap) { addEventListener("resize", fit); fit(); }

  /* ── interaction (E always, F in drawing mode) ────────────────────────
     In drawing mode each worker carries an item balloon, as on an
     assembly drawing. Hover, focus or tap opens it: the trade and a link
     to apply. A tap also gets a jump out of the worker. */
  if (!document.body.classList.contains("ind--story")) return;
  host.removeAttribute("aria-hidden");
  [ink, props, steps].forEach((n) => n.setAttribute("aria-hidden", "true"));
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", "The crew at work");

  const CREW = [
    { man: w, trade: "Welder", lead: [-34, -40], react: "sc-burst" },
    { man: rig, trade: "Rigger", lead: [40, -40] },
    { man: pair[1], trade: "Fitter", lead: [34, -40], label: "Fitters" },
  ];
  const calls = CREW.map((c, i) => {
    const call = el("g", { class: "sc-call" }, c.man.g);
    const [lx, ly] = c.lead, hy = -70, bx2 = lx, by2 = hy + ly;
    const right = lx > 0;
    el("path", { d: `M${right ? 4 : -4} ${hy}L${bx2} ${by2}`, class: "sc-call__lead" }, call);
    el("circle", { cx: bx2, cy: by2, r: 11, class: "sc-call__ball" }, call);
    el("text", { x: bx2, y: by2 + 4, class: "sc-call__no" }, call).textContent = i + 1;
    const tag = el("g", { class: "sc-call__tag" }, call);
    const tx0 = right ? bx2 + 18 : bx2 - 18, anchor = right ? "start" : "end";
    el("line", { x1: bx2 + (right ? 11 : -11), y1: by2, x2: tx0 + (right ? 104 : -104), y2: by2, class: "sc-call__rule" }, tag);
    el("text", { x: tx0, y: by2 - 6, "text-anchor": anchor, class: "sc-call__t" }, tag).textContent = (c.label || c.trade).toUpperCase();
    const link = el("a", { href: "#careers", class: "sc-call__a" }, tag);
    link.addEventListener("click", (e) => { // straight into the application, trade filled in, when it is open
      const d = document.getElementById("apply"), f = document.getElementById("a-trade");
      if (!d || !d.showModal) return;
      e.preventDefault();
      if (f) f.value = c.trade;
      d.showModal();
    });
    el("text", { x: tx0, y: by2 + 16, "text-anchor": anchor }, link).textContent = `Join as ${c.trade.toLowerCase()} →`;
    el("rect", { x: -16, y: -74, width: 32, height: 76, class: "sc-hit" }, c.man.g);
    c.man.g.classList.add("sc-man--live");
    return { ...c, call };
  });

  const close = () => calls.forEach((c) => c.man.g.classList.remove("is-open", c.react || "is-open"));
  calls.forEach((c) => {
    c.man.g.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // the link navigates as usual
      const open = c.man.g.classList.contains("is-open");
      close();
      if (open) return;
      c.man.g.classList.add("is-open");
      if (c.react) c.man.g.classList.add(c.react);
      if (c.man.g.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        c.man.g.animate([{ translate: "0 0" }, { translate: "0 -10px" }, { translate: "0 0" }], { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      }
    });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".sc-man--live")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
