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
    // a node may carry several tracks (say a slide and a fade): list them, not overwrite
    const prev = node.style.animationName;
    node.style.animationName = prev ? `${prev}, ${name}` : name;
    const d = `${opts.delay || 0}s`;
    node.style.animationDelay = prev ? `${node.style.animationDelay || "0s"}, ${d}` : d;
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

  /* ── the screens' stories ──────────────────────────────────────────── */
  const beat = (pairs) => pairs; // readability: [percent, value] lists
  const blink = (a, b, on = 1, off = 0) => [[0, off], [a - 0.01, off], [a, on], [b, on], [b + 0.01, off], [100, off]];
  const wave = (a, b, lo, hi, step = 2.2) => { const o = []; let k = 0; for (let t = a; t < b; t += step, k++) o.push([t, k % 2 ? hi : lo]); return o; };

  /* 01 SERVICES — power on, a seam welded, a plank laid: the electrician
     throws the breaker, the current runs down the cable, the welder drops
     his visor and runs the seam; up the tower the scaffolder lays a plank and
     nails it; the welder lifts his visor, wipes his brow and gives the
     electrician a thumbs up; power off. */
  {
    const L = layer(1, 24), ink2 = inkG(L), cr = crewG(L);
    // the steel frame and the welding set
    el("path", { d: "M360 400V250 M392 400V250 M352 250h48 M352 400h48 M392 300h86 M392 312h86 M478 300v12" }, ink2);
    el("path", { d: "M548 400V372h38v28 M552 378h14 M556 384h22" }, ink2);
    el("path", { d: "M586 396H1120", class: "sc-rib" }, ink2); // the cable
    // the tower and its ladder
    el("path", { d: "M740 400V230 M860 400V230 M736 230h128 M736 300h128 M736 350h128 M740 400L860 300 M740 300L860 230" }, ink2);
    for (let y = 392; y > 232; y -= 14) el("line", { x1: 778, y1: y, x2: 802, y2: y, class: "sc-rib" }, ink2);
    el("path", { d: "M778 400V226 M802 400V226" }, ink2);
    // the cabinet, its breaker and lamps
    el("path", { d: "M1120 400V286h84v114 M1120 300h84 M1162 300v100" }, ink2);
    const leverR = el("g", { transform: "translate(1140 336)" }, L);
    const lever = el("line", { x1: 0, y1: 0, x2: 0, y2: -14, class: "sc-tool" }, leverR);
    track(lever, "r", beat([[0, -40], [11, -40], [12.5, 40], [91, 40], [92.5, -40], [100, -40]]));
    [0, 1, 2].forEach((i) => { const l = el("rect", { x: 1132 + i * 14, y: 290, width: 8, height: 6, class: "sc-lamp" }, L); track(l, "o", [[0, .18], [12 + i, .18], [12.2 + i, 1], [92, 1], [92.2, .18], [100, .18]]); });
    // the current running down the cable to the set
    const pulse = el("circle", { cx: 1120, cy: 396, r: 3.5, class: "sc-pulse" }, L);
    track(pulse, "x", [[0, 0], [13, 0], [22, -534], [100, -534]], { lin: true });
    track(pulse, "o", blink(13, 22));
    // the welder
    const w2 = person(512, G, { cls: "sc-welder" }, cr);
    const visor = el("rect", { x: -6.5, y: -12, width: 13, height: 9, rx: 2, class: "sc-visor" }, w2.head);
    el("line", { x1: 0, y1: 11, x2: 0, y2: 18, class: "sc-tool" }, w2.aR.fore);
    const jit = wave(28, 62, 82, 88, 1.1);
    track(w2.aR.up, "r", merge([[0, 30], [24, 30], [27, 84]], jit, [[62, 84], [64, 30], [74, 30], [77, -160], [83, -160], [86, 30], [100, 30]]));
    track(w2.aR.fore, "r", merge([[0, 20], [24, 20], [27, 4], [62, 4], [64, 20], [74, 20], [77, -10], [83, -10], [86, 20], [100, 20]]));
    track(w2.aL.up, "r", merge([[0, 20], [27, 40], [62, 40], [65, 150], [70, 150], [73, 20], [100, 20]]));
    track(w2.aL.fore, "r", merge([[0, 0], [27, -50], [62, -50], [65, 60], [67, 30], [69, 60], [73, 0], [100, 0]]));
    track(w2.head, "r", [[0, 0], [18, 0], [21, -14], [24, -14], [26, 10], [62, 10], [64, 0], [74, -16], [86, -16], [89, 0], [100, 0]]);
    track(visor, "o", [[0, 0], [24.5, 0], [25.5, 1], [62, 1], [63, 0], [100, 0]]);
    const sp = sparksAt(482, 306, cr);
    track(sp, "o", blink(28, 62));
    breathe(w2, 5);
    label(420, "WELDING", L);
    // the scaffolder: up the ladder, lays the plank, nails it, back down
    const climb = el("g", {}, cr);
    const sc = person(790, G, { cls: "sc-climber" }, climb);
    track(climb, "y", [[0, 0], [4, 0], [28, -118], [60, -118], [86, 0], [100, 0]], { lin: true });
    const rung = (a, b, base, amp) => { const o = []; let k = 0; for (let t = a; t < b; t += 2.2, k++) o.push([t, base + (k % 2 ? amp : -amp)]); o.push([b, base]); return o; };
    track(sc.aL.up, "r", merge([[0, 8], [3, 170]], rung(4, 28, 165, 14), [[30, 60], [44, 60], [46, 8], [60, 8], [62, 170]], rung(62, 86, 165, 14), [[88, 8], [100, 8]]));
    track(sc.aR.up, "r", merge([[0, -8], [3, 190]], rung(4, 28, 195, -14), [[30, -80], [42, -80]], wave(44, 58, -150, -100, 1.4), [[60, -8], [62, 190]], rung(62, 86, 195, -14), [[88, -8], [100, -8]]));
    track(sc.lL.th, "r", merge(rung(4, 28, -20, 20), [[30, 0], [60, 0]], rung(62, 86, -20, 20), [[100, 0]]));
    track(sc.lL.sh, "r", merge(rung(4, 28, 25, 25), [[30, 0], [60, 0]], rung(62, 86, 25, 25), [[100, 0]]));
    track(sc.lR.th, "r", merge(rung(4, 28, -20, -20), [[30, 0], [60, 0]], rung(62, 86, -20, -20), [[100, 0]]));
    track(sc.lR.sh, "r", merge(rung(4, 28, 25, -25), [[30, 0], [60, 0]], rung(62, 86, 25, -25), [[100, 0]]));
    track(sc.head, "r", [[0, 0], [30, 0], [32, 14], [58, 14], [60, 0], [100, 0]]);
    const plank = el("rect", { x: 744, y: 225, width: 112, height: 5, class: "sc-plank" }, L);
    track(plank, "x", [[0, 60], [30, 60], [42, 0], [100, 0]]);
    track(plank, "o", [[0, 0], [30, 0], [31, 1], [96, 1], [99, 0], [100, 0]]);
    // the electrician
    const e = person(1240, G, { cls: "sc-sparky" }, cr);
    track(e.aR.up, "r", [[0, 10], [8, 10], [11, 84], [14, 84], [17, 10], [74, 10], [77, -165], [83, -165], [86, 10], [89, 10], [91, 84], [93, 84], [95, 10], [100, 10]]);
    track(e.aR.fore, "r", [[0, 0], [11, -20], [14, -20], [17, 0], [77, 0], [78, -30], [80, 10], [82, -30], [84, 0], [100, 0]]);
    track(e.head, "r", [[0, 8], [10, 8], [18, -18], [24, -18], [28, 8], [72, 8], [74, -20], [86, -20], [88, 8], [100, 8]]);
    breathe(e, 5);
    label(1180, "ELECTRICAL", L);
  }

  /* 02 PROJECTS — the inspector walks the hull with his torch, finds a bad
     patch, calls the painters down; they paint it over; he checks it under
     the torch, thumbs up, and walks back as the cradle goes up again. */
  {
    const L = layer(2, 28), ink2 = inkG(L), cr = crewG(L);
    el("path", { d: "M320 226H1210L1300 200L1262 296Q1232 370 1150 372H420Q352 372 332 324Z" }, ink2);
    el("path", { d: "M340 226V170H470V226 M356 186h20 M386 186h20 M416 186h20 M446 186h20 M400 170V146h14V170" }, ink2);
    el("line", { x1: 330, y1: 312, x2: 1272, y2: 312, class: "sc-rib sc-dash" }, ink2);
    for (let x = 520; x < 1180; x += 60) el("line", { x1: x, y1: 228, x2: x, y2: 370, class: "sc-rib" }, ink2);
    [460, 640, 820, 1000, 1120].forEach((x) => el("rect", { x: x - 14, y: 372, width: 28, height: 28 }, ink2));
    el("path", { d: "M690 340V176 M850 340V176 M680 176h20 M840 176h20", class: "sc-rib" }, ink2);
    // the bad patch, and the fresh paint over it
    const bad = el("path", { d: "M752 280l10 8l-4 6l12 4l-8 8l10 6 M760 296l14-2", class: "sc-defect" }, L);
    const ring = el("circle", { cx: 768, cy: 298, r: 22, class: "sc-mark" }, L);
    const fresh = el("rect", { x: 740, y: 280, width: 58, height: 36, class: "sc-fresh" }, L);
    track(bad, "o", [[0, 1], [60, 1], [70, 0], [98, 0], [99, 1], [100, 1]]);
    track(ring, "o", [[0, 0], [36, 0], [37, 1], [46, 1], [47, 0], [79, 0], [80, 1], [86, 1], [87, 0], [100, 0]]);
    track(fresh, "o", [[0, 0], [58, 0], [72, 1], [97, 1], [99, 0], [100, 0]]);
    // the cradle and its painters
    const cradle = el("g", {}, L);
    track(cradle, "y", [[0, 0], [46, 0], [56, 84], [86, 84], [96, 0], [100, 0]]);
    el("path", { d: "M680 250h180 M680 256h180", class: "sc-beam" }, cradle);
    const cc = crewG(cradle);
    [735, 805].forEach((x, i) => {
      const pnt = person(x, 250, { cls: "sc-painter" }, cc);
      el("path", { d: "M0 11 v10 M-5 21 h10", class: "sc-tool" }, pnt.aR.fore);
      const roll = wave(58, 74, -112, -78, 1.8).map(([t, v]) => [t + i * 0.9, v]);
      track(pnt.aR.up, "r", merge([[0, -20], [44, -20], [48, -120], [56, -120]], roll, [[76, -20], [84, -20], [86, -160], [89, -140], [92, -20], [100, -20]]));
      track(pnt.aR.fore, "r", [[0, 0], [100, 0]]);
      track(pnt.head, "r", [[0, 0], [40, 0], [42, 16], [48, 16], [50, 0], [84, 0], [86, 12], [92, 12], [94, 0], [100, 0]]);
      breathe(pnt, 6);
    });
    // the inspector: out with the torch, stops, calls up, checks, thumbs up, back
    const rounds = el("g", {}, cr);
    track(rounds, "x", [[0, 0], [35, 300], [88, 300], [100, 0]], { lin: true });
    const ins = person(470, G, { cls: "sc-inspector" }, rounds);
    const out = walk(0, 35, -1, 0, false, 2.4), back = walk(88, 100, 1, 1, true, 1.6);
    ["L", "R"].forEach((S) => {
      track(ins[`l${S}`].th, "r", merge(out[`th${S}`], [[35, 0], [88, 0]], back[`th${S}`]));
      track(ins[`l${S}`].sh, "r", merge(out[`sh${S}`], [[35, 0], [88, 0]], back[`sh${S}`]));
    });
    track(ins.bob, "y", merge(out.bob, [[35, 0], [88, 0]], back.bob));
    track(ins.aR.up, "r", [[0, -150], [35, -150], [38, -150], [40, -10], [79, -10], [80, -150], [86, -150], [87, -160], [91, -160], [92, -10], [100, -150]]);
    track(ins.aR.fore, "r", [[0, -20], [86, -20], [87, -40], [91, -40], [92, 0], [100, -20]]);
    track(ins.aL.up, "r", merge([[0, 10], [40, 10], [41, 150]], wave(41, 48, 150, 175, 1.2), [[48, 10], [100, 10]]));
    track(ins.head, "r", [[0, -10], [34, -10], [38, -20], [48, -20], [50, -8], [56, -16], [76, -16], [80, -20], [88, -20], [90, 0], [100, -10]]);
    const beamT = el("path", { d: "M2 -66 L-40 -150 L50 -150 Z", class: "sc-torch" }, ins.g);
    track(beamT, "o", [[0, .55], [38, .55], [39, 0], [79, 0], [80, .55], [86, .55], [87, 0], [99, 0], [100, .55]]);
  }

  /* 03 CAREERS — hiring day: new crew drop in without helmets, walk up to the
     recruiter, he checks them off and hands each a helmet, and only then do
     they walk on through the gate. */
  {
    const T = 24;
    const L = layer(3, T), ink2 = inkG(L), cr = crewG(L);
    el("path", { d: "M1350 400V306 M1410 400V306" }, ink2);
    el("rect", { x: 1300, y: 262, width: 160, height: 44, class: "sc-sign" }, ink2);
    el("text", { x: 1380, y: 290, class: "sc-label sc-label--sign" }, ink2).textContent = "JOIN THE CREW";
    el("path", { d: "M1490 400V300 M1570 400V300 M1484 300h92 M1490 320h80" }, ink2); // the gate
    const rec = person(1250, G, { cls: "sc-recruiter" }, cr);
    el("rect", { x: -6, y: 10, width: 12, height: 15, class: "sc-board" }, rec.aR.fore);
    const held = el("path", { d: "M-7.5 18 A7.5 7.5 0 0 1 7.5 18 Z M-10 18 H10", class: "sc-helmet sc-held" }, rec.aL.fore);
    // a beat per arrival: check off on the clipboard, then hold out a helmet
    const beats = [62, 28.7, 95.3];
    const bl = [], br = [], bh = [], bo = [];
    beats.forEach((s) => {
      [[0, 10], [3, 10], [5, 82], [9, 82], [10, 10]].forEach(([d, v]) => bl.push([(s + d) % 100, v]));
      [[0, -40], [1, -40], [2, -60], [3, -40], [4, -60], [5, -40]].forEach(([d, v]) => br.push([(s + d) % 100, v]));
      [[0, 10], [2, 10], [3, -12], [4, 10], [9, 10]].forEach(([d, v]) => bh.push([(s + d) % 100, v]));
      [[0, 0], [4.9, 0], [5, 1], [9, 1], [9.1, 0]].forEach(([d, v]) => bo.push([(s + d) % 100, v]));
    });
    const tidy = (a, rest) => { const o = [...a].sort((x, y) => x[0] - y[0]); o.unshift([0, rest]); o.push([100, rest]); return o; };
    track(rec.aL.up, "r", tidy(bl, 10)); track(rec.aL.fore, "r", [[0, 0], [100, 0]]);
    track(rec.aR.up, "r", tidy(br, -40)); track(rec.aR.fore, "r", [[0, 70], [100, 70]]);
    track(rec.head, "r", tidy(bh, 10));
    track(held, "o", tidy(bo, 0));
    [[620, 0], [860, -8], [480, -16]].forEach(([lx, delay], j) => {
      const opts = { delay };
      const drift = el("g", {}, cr);
      track(drift, "x", [[0, -40], [12, 30], [24, -20], [36, 0], [40, 0], [62, 1200 - lx], [72, 1200 - lx], [100, 1720 - lx]], { ...opts, lin: true });
      const fall = el("g", {}, drift);
      track(fall, "y", [[0, -420], [36, 0], [100, 0]], { ...opts, lin: true });
      const chute = el("g", { class: "sc-chute", transform: `translate(${lx} ${G})` }, fall);
      el("path", { d: "M-6 -50 L-36 -112 M6 -50 L36 -112 M0 -50 L0 -118" }, chute);
      el("path", { d: "M-40 -110 Q-40 -150 0 -152 Q40 -150 40 -110 Q30 -118 20 -110 Q10 -118 0 -110 Q-10 -118 -20 -110 Q-30 -118 -40 -110 Z", class: "sc-canopy" }, chute);
      el("path", { d: "M-10 -151 Q0 -152 10 -151 L8 -113 Q0 -118 -8 -113 Z", class: "sc-canopy__panel" }, chute);
      track(chute, "o", [[0, 1], [36, 1], [41, 0], [99, 0], [100, 1]], opts);
      const m = person(lx, G, { cls: "sc-jumper" }, fall);
      track(m.head.lastChild, "o", [[0, 0], [67, 0], [68, 1], [99.5, 1], [100, 0]], opts); // no helmet until he is given one
      const w1 = walk(40, 62, -1, j, true, 2.2), w2 = walk(72, 100, -1, j + 1, true, 2.2);
      ["L", "R"].forEach((S) => {
        const sg = S === "L" ? 1 : -1;
        track(m[`l${S}`].th, "r", merge([[0, 6 * sg], [35, 6 * sg], [37, 28 * sg], [39, 28 * sg], [40, 0]], w1[`th${S}`], [[62, 0], [72, 0]], w2[`th${S}`]), opts);
        track(m[`l${S}`].sh, "r", merge([[0, 0], [35, 0], [37, -50 * sg], [39, -50 * sg], [40, 0]], w1[`sh${S}`], [[62, 0], [72, 0]], w2[`sh${S}`]), opts);
        track(m[`a${S}`].fore, "r", merge([[0, 0], [40, 0]], w1[`fa${S}`], [[62, 0], [72, 0]], w2[`fa${S}`]), opts);
      });
      track(m.aL.up, "r", merge([[0, 160], [36, 160], [39, 30], [40, 8]], w1.uaL, [[62, 8], [72, 8]], w2.uaL), opts);
      track(m.aR.up, "r", merge([[0, -160], [36, -160], [39, -30], [40, -8]], w1.uaR, [[62, -8], [65, -70], [67, -170], [68.5, -170], [70, -8], [72, -8]], w2.uaR), opts);
      track(m.head, "r", [[0, 0], [62, 0], [64, -8], [70, -8], [72, 0], [100, 0]], opts);
      track(m.bob, "y", merge([[0, 0], [35, 0], [37, 8], [39, 8], [40, 0]], w1.bob, [[62, 0], [72, 0]], w2.bob), opts);
    });
  }

  /* 04 CONTACT — the phone on the crate rings; he answers, listens, points
     over to the man with the megaphone, who calls it out, and the third
     waves you over; he hangs up and writes it down. */
  {
    const L = layer(4, 16), ink2 = inkG(L), cr = crewG(L);
    el("rect", { x: 1060, y: 362, width: 60, height: 38 }, ink2);
    el("path", { d: "M1060 381h60 M1090 362v38", class: "sc-rib" }, ink2);
    const cradleSet = el("rect", { x: 1102, y: 354, width: 14, height: 8, class: "sc-handset" }, L);
    track(cradleSet, "o", [[0, 1], [14, 1], [14.5, 0], [84, 0], [84.5, 1], [100, 1]]);
    track(cradleSet, "x", merge(wave(0, 12, -1.5, 1.5, 0.6), [[12, 0], [100, 0]]));
    [0, 1, 2].forEach((i) => { const a = el("path", { d: `M${1124 + i * 7} ${348 - i * 3} q8 8 0 16`, class: "sc-ring" }, L); track(a, "o", merge([[0, 0]], ...[0, 3, 6, 9].map((s) => [[s + i * 0.6, 0], [s + i * 0.6 + 0.3, 1], [s + i * 0.6 + 1.6, 0]]), [[12, 0], [100, 0]])); });
    const ph = person(1090, 362 + 18, { cls: "sc-phone" }, cr);
    track(ph.lL.th, "r", [[0, -80], [100, -80]]); track(ph.lR.th, "r", [[0, -80], [100, -80]]);
    track(ph.lL.sh, "r", [[0, 80], [50, 95], [100, 80]]); track(ph.lR.sh, "r", [[0, 95], [50, 80], [100, 95]]);
    track(ph.aR.up, "r", [[0, -40], [12, -40], [14, -110], [16, -150], [80, -150], [83, -60], [86, -40], [100, -40]]);
    track(ph.aR.fore, "r", [[0, 20], [12, 20], [16, -150], [80, -150], [84, 20], [100, 20]]);
    const hand = el("rect", { x: -3, y: 6, width: 6, height: 11, class: "sc-handset" }, ph.aR.fore);
    track(hand, "o", [[0, 0], [14.5, 0], [15, 1], [83.5, 1], [84, 0], [100, 0]]);
    track(ph.aL.up, "r", merge([[0, 30], [38, 30], [40, 92], [50, 92], [52, 30]], wave(86, 98, 30, 44, 1.5), [[100, 30]]));
    track(ph.aL.fore, "r", [[0, -40], [38, -40], [40, 0], [50, 0], [52, -40], [86, -60], [98, -60], [100, -40]]);
    const note = el("rect", { x: 1104, y: 368, width: 12, height: 9, class: "sc-paper" }, L);
    track(note, "o", [[0, 0], [86, 0], [87, 1], [99, 1], [100, 0]]);
    track(ph.head, "r", [[0, 14], [12, 14], [16, 6], [38, 6], [40, -20], [50, -20], [52, 6], [84, 6], [86, 18], [100, 14]]);
    [0, 1, 2].forEach((i) => { const d = el("circle", { cx: 1112 + i * 9, cy: G - 92, r: 2.5, class: "sc-dot2" }, L); track(d, "o", merge([[0, 0], [18, 0]], wave(18 + i * 0.4, 36, 0.2, 1, 1.2), [[36, 0], [100, 0]])); });
    // the megaphone
    const mg = person(520, G, { cls: "sc-caller" }, cr);
    el("path", { d: "M-3 11 L-3 20 L-12 30 L12 30 L3 20 L3 11 Z", class: "sc-megaphone" }, mg.aR.fore);
    track(mg.aR.up, "r", [[0, -30], [46, -30], [50, -100], [76, -100], [80, -30], [100, -30]]);
    track(mg.aR.fore, "r", [[0, 40], [46, 40], [50, -20], [76, -20], [80, 40], [100, 40]]);
    track(mg.aL.up, "r", [[0, 10], [100, 10]]);
    track(mg.head, "r", [[0, 0], [38, 0], [41, 18], [46, 18], [49, -8], [76, -8], [80, 0], [100, 0]]);
    breathe(mg, 6);
    [0, 1, 2].forEach((i) => { const a = el("path", { d: `M${560 + i * 18} ${G - 78} q12 14 0 28`, class: "sc-wave2" }, L); track(a, "o", merge([[0, 0], [50, 0]], ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => [[51 + k * 3 + i, 0], [51.6 + k * 3 + i, 1], [53 + k * 3 + i, 0]]), [[77, 0], [100, 0]])); });
    // the waver
    const wv = person(800, G, { cls: "sc-waver" }, cr);
    const wL = merge([[0, 8], [55, 8]], wave(56, 80, 118, 140, 2), [[82, 8], [100, 8]]), wR = merge([[0, -8], [55, -8]], wave(56, 80, -140, -118, 2), [[82, -8], [100, -8]]);
    track(wv.aL.up, "r", wL); track(wv.aR.up, "r", wR);
    track(wv.aL.fore, "r", wL.map(([t, v]) => [t, v > 130 ? 40 : v > 100 ? 10 : 0])); track(wv.aR.fore, "r", wR.map(([t, v]) => [t, v < -130 ? -40 : v < -100 ? -10 : 0]));
    track(wv.bob, "y", merge([[0, 0], [55, 0]], wave(56, 80, 0, -4, 2), [[82, 0], [100, 0]]));
    track(wv.head, "r", [[0, 0], [48, 0], [52, -14], [56, 0], [100, 0]]);
  }

  /* 05 THE END — lunch on the beam, and a photographer: he carries his tripod
     in, sets it up and calls for a picture; they all turn and give a thumbs
     up (the old lunch-on-a-beam photograph); the flash; he waves a thank-you
     and goes; back to lunch, and a cup of coffee goes down the line. */
  {
    const L = layer(5, 22), ink2 = inkG(L), cr = crewG(L);
    const by2 = 330;
    el("path", { d: `M360 ${by2}H1240 M360 ${by2 + 12}H1240 M360 ${by2}v12 M1240 ${by2}v12` }, ink2);
    [420, 1180].forEach((x) => el("path", { d: `M${x - 30} ${G}L${x} ${by2 + 12}L${x + 30} ${G} M${x - 18} ${G - 24}h36` }, ink2));
    const xs = [500, 640, 780, 920, 1060], men = [];
    const POSE = [30, 46]; // the picture: turn to the camera, thumbs up
    xs.forEach((x, i) => {
      const s = person(x, by2 + 25, { cls: "sc-luncher" }, cr);
      men.push(s);
      const sw = []; for (let t = 0; t < 100; t += 12.5) sw.push([t, 0], [t + 6.25, 24]);
      track(s.lL.th, "r", [[0, -84], [100, -84]]); track(s.lR.th, "r", [[0, -78], [100, -78]]);
      track(s.lL.sh, "r", sw.map(([t, v]) => [((t + i * 3) % 100), 84 + v]).sort((a, b) => a[0] - b[0]));
      track(s.lR.sh, "r", sw.map(([t, v]) => [((t + i * 3 + 6) % 100), 78 + 24 - v]).sort((a, b) => a[0] - b[0]));
      breathe(s, 5);
      track(s.head, "r", [[0, 0], [24, 0], [27, x < 820 ? 10 : -10], [POSE[0], 0], [POSE[1], 0], [100, 0]]);
    });
    // everyone but the coffee hand gives a thumbs up for the picture
    [3, 4].forEach((i) => {
      track(men[i].aR.up, "r", [[0, -10], [POSE[0] - 2, -10], [POSE[0], -150], [POSE[1], -150], [POSE[1] + 2, -10], [100, -10]]);
      track(men[i].aR.fore, "r", [[0, 0], [POSE[0], 30], [POSE[1], 30], [POSE[1] + 2, 0], [100, 0]]);
    });
    // 0: the sandwich, bitten into — and held up for the picture
    el("rect", { x: -5, y: 9, width: 10, height: 5, class: "sc-food" }, men[0].aR.fore);
    track(men[0].aR.up, "r", [[0, -30], [8, -30], [12, -150], [18, -150], [22, -30], [POSE[0] - 2, -30], [POSE[0], -150], [POSE[1], -150], [POSE[1] + 2, -30], [64, -30], [68, -150], [74, -150], [78, -30], [100, -30]]);
    track(men[0].aR.fore, "r", [[0, 0], [8, 0], [12, -150], [18, -150], [22, 0], [POSE[0] - 2, 0], [POSE[0], 20], [POSE[1], 20], [POSE[1] + 2, 0], [64, 0], [68, -150], [74, -150], [78, 0], [100, 0]]);
    // 1: the coffee, raised for the picture, later handed down the line to 2
    const cup = el("rect", { x: 646, y: 300, width: 8, height: 9, class: "sc-food" }, L);
    track(cup, "x", [[0, 0], [78, 0], [86, 132], [96, 132], [98, 0], [100, 0]]);
    track(cup, "y", [[0, 0], [POSE[0] - 2, 0], [POSE[0], -30], [POSE[1], -30], [POSE[1] + 2, 0], [100, 0]]);
    track(cup, "o", [[0, 1], [96, 1], [97, 0], [99, 0], [100, 1]]);
    track(men[1].aL.up, "r", [[0, 40], [POSE[0] - 2, 40], [POSE[0], 150], [POSE[1], 150], [POSE[1] + 2, 40], [76, 40], [80, -80], [86, -80], [90, 40], [100, 40]]);
    track(men[2].aR.up, "r", [[0, -10], [84, -10], [86, 60], [90, 60], [92, -150], [96, -150], [98, -10], [100, -10]]);
    track(men[2].aR.fore, "r", [[0, 0], [90, 0], [92, -150], [96, -150], [98, 0], [100, 0]]);
    // 2: the paper, lowered for the picture
    const paper = el("rect", { x: -22, y: -54, width: 44, height: 26, class: "sc-paper" }, men[2].bob);
    track(paper, "y", [[0, 0], [POSE[0] - 4, 0], [POSE[0] - 1, 18], [POSE[1], 18], [POSE[1] + 3, 0], [100, 0]]);
    // the photographer and his tripod, in from the left and out again
    const ph = el("g", {}, cr);
    track(ph, "x", [[0, -760], [8, -760], [24, 0], [56, 0], [74, -760], [100, -760]], { lin: true });
    const tri = el("g", {}, ph);
    el("path", { d: "M720 400L732 352L744 400 M732 352v48 M722 346h20v10h-20Z M742 349l6-2v8l-6-2", class: "sc-tripod" }, tri);
    const flash = el("circle", { cx: 748, cy: 351, r: 26, class: "sc-flash" }, tri);
    track(flash, "o", [[0, 0], [38.5, 0], [39, 1], [41, 0], [100, 0]]);
    const pg = person(700, G, { cls: "sc-photo" }, ph);
    const wk = walk(10, 24, -1, 0, false, 1.8), wb = walk(56, 72, 1, 1, true, 1.8);
    ["L", "R"].forEach((S2) => {
      track(pg[`l${S2}`].th, "r", merge(wk[`th${S2}`], [[24, 0], [56, 0]], wb[`th${S2}`]));
      track(pg[`l${S2}`].sh, "r", merge(wk[`sh${S2}`], [[24, 0], [56, 0]], wb[`sh${S2}`]));
    });
    track(pg.bob, "y", merge(wk.bob, [[24, 0], [26, 6], [36, 6], [38, 4], [42, 4], [44, 0], [56, 0]], wb.bob));
    // carries the tripod, crouches to the camera, calls them, presses, waves thanks
    track(pg.aR.up, "r", merge([[0, -60], [24, -60], [26, -80], [36, -80], [38, -96], [42, -96], [44, -10], [48, -10], [50, -160]], wave(50, 54, -160, -140, 1), [[55, -10], [56, -60], [100, -60]]));
    track(pg.aR.fore, "r", [[0, -20], [36, -20], [38, -30], [42, -30], [44, 0], [100, -20]]);
    track(pg.aL.up, "r", merge([[0, 30], [24, 30], [27, 150]], wave(27, 34, 150, 175, 1.2), [[35, 30], [100, 30]]));
    track(pg.head, "r", [[0, 0], [24, 0], [26, -10], [36, -10], [44, 0], [100, 0]]);
  }

  /* show the layer for the section in view; the others pause */
  const layers = [...svg.querySelectorAll(".sc-layer")];
  const wrapEl = host.closest(".in-wrap");
  /* phones: no room for the whole yard, so each screen gets a close-up —
     a camera on one worker (and whoever is beside him). x is where he
     stands, h how much height the shot takes in. */
  const SHOT = { 0: { x: 400, h: 240 }, 1: { x: 512, h: 200 }, 2: { x: 770, h: 250 }, 3: { x: 1250, h: 210 }, 4: { x: 560, h: 190 }, 5: { x: 640, h: 210 } };
  const STRIP = 150; // px
  const phone = () => innerWidth < 1100;
  const aim = () => {
    if (!phone()) { svg.setAttribute("viewBox", "0 0 1600 420"); return; }
    const st = (wrapEl && wrapEl.dataset.step) || "0", shot = SHOT[st] || SHOT[0];
    const w = shot.h * (host.clientWidth / STRIP);
    svg.setAttribute("viewBox", `${(shot.x - w * 0.3).toFixed(1)} ${420 - shot.h} ${w.toFixed(1)} ${shot.h}`);
  };
  /* the layer for the section in view; js/runners.js brings its crew in over the page */
  let shown = null;
  const show = () => {
    const st = (wrapEl && wrapEl.dataset.step) || "0";
    const next = layers.find((l) => l.dataset.for === st);
    if (next === shown) { aim(); return; }
    const prev = shown;
    shown = next;
    layers.forEach((l) => l.classList.toggle("is-on", l === next));
    aim();
    if (prev) host.dispatchEvent(new CustomEvent("scene:show", { detail: { layer: next, prev } }));
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
    if (phone()) {
      // phones: a strip with a close-up of one worker (see SHOT)
      svgEl.setAttribute("preserveAspectRatio", "xMidYMax meet");
      host.style.height = STRIP + "px";
      wrap.style.setProperty("--scene-h", STRIP - 10 + "px");
      wrap.style.removeProperty("--h1-fit");
      aim();
      return;
    }
    aim();
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
