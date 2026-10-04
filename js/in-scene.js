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
  let hatch = ""; // one path, not 343 lines: fewer nodes to restyle and paint
  for (let x = -1600; x < 3200; x += 14) hatch += `M${x} ${G + 2}L${x - 10} ${G + 12}`;
  el("path", { d: hatch, class: "sc-hatch" }, shared);

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
    const fmt = kind === "r" ? (v) => `transform: rotate(${v}deg)` : kind === "y" ? (v) => `transform: translateY(${v}px)` : kind === "x" ? (v) => `transform: translateX(${v}px)` : kind === "sx" ? (v) => `transform: scaleX(${v})` : (v) => `opacity: ${v}`;
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
    el("path", { d: "M360 400V250 M392 400V250 M352 250h48 M352 400h48 M392 347h88 M392 359h88 M480 347v12" }, ink2);
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
    const sp = sparksAt(483, 353, cr); // the torch tip: up 84°, fore 4°, tool to 18
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
    // the queue: when the recruiter is late (he is still on his way over the page),
    // the next three stand in line with no helmets and grumble until he lands
    const queue = el("g", { class: "sc-queue" }, cr);
    const QX = [1196, 1150, 1104];
    QX.forEach((qx, i) => {
      const q = person(qx, G, { cls: "sc-queuer" }, queue);
      q.g.dataset.qx = qx;
      q.head.lastChild.classList.add("sc-qhelmet");
      // gripes: a fist shaken, arms thrown up, a turn to the man behind
      const gest = [
        merge([[0, 8], [10, 8], [12, -150]], wave(12, 30, -150, -170, 1.4), [[32, -8], [60, -8], [62, -120], [70, -120], [72, -8], [100, -8]]),
        merge([[0, -8], [20, -8], [22, -140], [30, -140], [32, -8]], wave(48, 64, -150, -175, 1.6), [[66, -8], [100, -8]]),
        merge([[0, -8], [36, -8], [38, -100], [52, -100], [54, -8], [80, -8], [82, -150], [90, -150], [92, -8], [100, -8]]),
      ][i];
      track(q.aR.up, "r", gest);
      track(q.aL.up, "r", i === 1 ? merge([[0, 8], [20, 8], [22, 140], [30, 140], [32, 8], [100, 8]]) : [[0, 30], [50, 30], [52, 60], [58, 60], [60, 30], [100, 30]]);
      track(q.aL.fore, "r", [[0, -60], [100, -60]]);
      track(q.head, "r", [[0, 0], [14 + i * 9, 0], [16 + i * 9, i === 0 ? 18 : -18], [26 + i * 9, i === 0 ? 18 : -18], [28 + i * 9, 0], [70, 0], [72, 10], [80, 10], [82, 0], [100, 0]]);
      breathe(q, 3 + i);
      const g = el("text", { x: qx + 8, y: G - 78, class: "sc-gripe" }, queue);
      g.textContent = ["#@!", "?!", "!!"][i];
      track(g, "o", merge([[0, 0]], ...[[10, 22], [40, 52], [72, 86]].map(([a, b]) => [[a + i * 6, 0], [a + i * 6 + 1, 1], [b + i * 6, 1], [b + i * 6 + 1, 0]]), [[100, 0]]));
    });
    const arrivals = el("g", { class: "sc-arrivals" }, cr);
    [[620, 0], [860, -8], [480, -16]].forEach(([lx, delay], j) => {
      const opts = { delay };
      const drift = el("g", {}, arrivals);
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
    // drawing mode: a sign, MADE BY ALDY, and the man who comes to put it up
    const aldyG = el("g", { class: "sc-aldy-g" }, L);
    const sign = el("g", { class: "sc-aldy" }, aldyG);
    const tilt = el("g", { class: "sc-aldy__tilt", style: "transform-origin: 1352px 400px" }, sign); // pivots on its right post
    el("path", { d: "M1300 400V386 M1352 400V386", class: "sc-post" }, tilt);
    const link = el("a", { href: "https://aldystudio.com", target: "_blank", rel: "noopener", class: "sc-aldy__link", "aria-label": "Made by ALDY — aldystudio.com" }, tilt);
    el("rect", { x: 1262, y: 340, width: 128, height: 46, class: "sc-aldy__board" }, link);
    el("use", { href: "#aldy", x: 1272, y: 349, width: 28, height: 28, class: "sc-aldy__mark" }, link);
    el("text", { x: 1310, y: 356, class: "sc-aldy__s" }, link).textContent = "MADE BY";
    el("text", { x: 1309, y: 378, class: "sc-aldy__t" }, link).textContent = "ALDY";
    /* his day at the sign (drawing mode): four blows of the mallet, and the
       last knocks it crooked; he steps back, scratches his helmet, walks up
       and shoves it level. Thumbs up for the photographer's picture, a wipe
       of the brow, a polish with a rag, then back a few paces to admire it. */
    const sg = el("g", { class: "sc-signer-g" }, crewG(aldyG));
    const pos = el("g", {}, sg);
    const signer = person(1232, G, { cls: "sc-signer" }, pos);
    const mallet = el("path", { d: "M0 18 v6 M-5 24 h10", class: "sc-tool" }, signer.aR.fore);
    const rag = el("rect", { x: -4, y: 19, width: 8, height: 6, class: "sc-rag" }, signer.aR.fore);
    const P = 8, B = -26; // at the board, and stood back from it
    const HIT = [2.2, 4.6, 7, 9.4];
    const W1 = walk(12, 16, 1, 0, true), W2 = walk(22, 26, -1, 1, true), W3 = walk(75, 79, 1, 0, true), W4 = walk(91, 95, -1, 1, true);
    track(pos, "x", [[0, P], [12, P], [16, B], [22, B], [26, P], [54.5, P], [56, 22], [73.5, 22], [75, P], [79, B], [91, B], [95, P], [100, P]], { lin: true });
    ["L", "R"].forEach((S) => ["th", "sh"].forEach((j) => track(signer[`l${S}`][j], "r",
      merge([[0, 0], [11.4, 0]], W1[j + S], [[21.4, 0]], W2[j + S], [[74.4, 0]], W3[j + S], [[90.4, 0]], W4[j + S], [[100, 0]]))));
    track(signer.aR.up, "r", merge([[0, -60]], ...HIT.map((h) => [[h - 1, -150], [h, -85]]), [[10.4, -85], [11.4, -30]],
      W1.uaR, [[17, -20], [21.4, -8]], W2.uaR, [[26.5, -60], [27.2, -140], [28.2, -125], [29, -60]],
      [[31, -60], [32, -150], [44, -150], [45.5, -60]],
      [[55, -60], [56, -110]], wave(57, 73, -100, -128, 1.5), [[74, -110]], W3.uaR,
      [[84, -8], [85, -150], [90, -150], [90.6, -8]], W4.uaR, [[96, -8], [99, -60], [100, -60]]));
    track(signer.aR.fore, "r", merge([[0, 20]], ...HIT.map((h) => [[h - 1, 40], [h, -5]]), [[10.4, -5], [11.4, 10]],
      W1.faR, [[21.4, 0]], W2.faR, [[26.5, 10], [27.2, 0], [29, 10]], [[31, 10], [32, 30], [44, 30], [45.5, 10]],
      [[55, 10]], wave(57, 73, -10, 25, 1.5), [[74, 0]], W3.faR,
      [[84, 0], [85, 30], [90, 30], [90.6, 0]], W4.faR, [[96, 0], [99, 20], [100, 20]]));
    track(signer.aL.up, "r", merge([[0, 8], [11.4, 8]], W1.uaL, [[16.6, 8], [17.6, 165], [21, 165], [21.6, 8]], W2.uaL,
      [[47, 8], [48.5, 150], [51, 150], [52.5, 110], [53.5, 8]], [[74.4, 8]], W3.uaL, [[90.4, 8]], W4.uaL, [[100, 8]]));
    track(signer.aL.fore, "r", merge([[0, 0], [11.4, 0]], W1.faL, [[16.6, 0], [17.6, -110]], wave(18.2, 21, -100, -130, 0.6), [[21.6, 0]], W2.faL,
      [[47, 0], [48.5, -140], [51, -140], [52.5, -150], [53.5, 0]], [[74.4, 0]], W3.faL, [[90.4, 0]], W4.faL, [[100, 0]]));
    track(signer.head, "r", merge([[0, 8], [11, 8], [12, 0], [16, 0], [17, 14], [18.5, 14], [19, -4], [20, -4], [20.5, 14], [21.5, 14], [22, 0], [26, 0],
      [26.5, 8], [29, 8], [31, -12], [44, -12], [46, 0], [48, 0], [49, -10], [53, -10], [54, 0], [56, 10], [74, 10], [75, 0], [80, 0]],
      wave(80, 84.5, 0, 10, 0.75), [[85, -6], [90, -6], [91, 0], [95, 0], [96, 8], [100, 8]]));
    track(signer.bob, "y", merge([[0, 0]], ...HIT.map((h) => [[h - 0.3, 0], [h, 1.2], [h + 0.4, 0]]), [[11.4, 0]], W1.bob, W2.bob,
      wave(30, 74, 0, -0.8, 2), [[74.4, 0]], W3.bob, wave(80, 90, 0, -0.8, 2), W4.bob, [[100, 0]]));
    track(mallet, "o", [[0, 1], [54.6, 1], [55, 0], [74.6, 0], [75, 1], [100, 1]]);
    track(rag, "o", [[0, 0], [54.6, 0], [55, 1], [74.6, 1], [75, 0], [100, 0]]);
    // the sign answers each blow, and the last one knocks it crooked until he shoves it level
    track(tilt, "r", merge([[0, 0]], ...HIT.slice(0, 3).map((h) => [[h, 0], [h + 0.25, -0.9], [h + 0.8, 0]]),
      [[9.4, 0], [9.7, 3.6], [10.2, 2.4], [10.6, 2.8], [27, 2.8], [27.6, -1.2], [28.3, 0.5], [29, 0], [100, 0]]));
    const ticks = el("path", { d: "M1262 334l-3-6 M1268 333v-7 M1274 334l3-6", class: "sc-tick" }, sg);
    track(ticks, "o", merge([[0, 0]], ...HIT.map((h) => [[h - 0.01, 0], [h, 1], [h + 0.6, 1], [h + 0.61, 0]]), [[100, 0]]));

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
  /* ── the cast: drawing mode only ─────────────────────────────────────
     Four regulars who turn up on every screen, each on a long loop of his
     own: the FOREMAN (white helmet, a mug, a watch, a secret dancer), the
     OLD HAND (a moustache, a stoop, naps, always right), the ROOKIE (too big
     a helmet, runs everywhere, drops things) and the one with HEADPHONES.
     Scripted in seconds; hands are placed by target (ik), not by angle. */
  const castOf = (step, T) => el("g", { class: "sc-cast sc-crew", style: `--T:${T}s` }, svg.querySelector(`.sc-layer[data-for="${step}"]`));
  const at = (T, pairs) => pairs.map(([t, v]) => [(t / T) * 100, v]);
  const tk = (node, kind, T, pairs, opts) => track(node, kind, at(T, pairs), opts);
  // a hand to (hx, hy), feet at 0 0, shoulder at 0 -48, both bones 11
  const ik = (side, hx, hy, elbow = "down") => {
    let dx = hx, dy = hy + 48, d = Math.hypot(dx, dy) || 1;
    if (d > 21.8) { dx *= 21.8 / d; dy *= 21.8 / d; d = 21.8; }
    const h = Math.sqrt(Math.max(0, 121 - (d / 2) ** 2)), px = -dy / d, py = dx / d;
    const e1 = [dx / 2 + px * h, dy / 2 + py * h], e2 = [dx / 2 - px * h, dy / 2 - py * h];
    const first = elbow === "down" ? e1[1] >= e2[1] : elbow === "up" ? e1[1] <= e2[1] : elbow === "out" ? Math.abs(e1[0]) >= Math.abs(e2[0]) : Math.abs(e1[0]) <= Math.abs(e2[0]);
    const [ex, ey] = first ? e1 : e2;
    const ang = (vx, vy) => Math.atan2(-vx, vy) * 180 / Math.PI;
    const wrap = (v, lo) => { while (v <= lo) v += 360; while (v > lo + 360) v -= 360; return Math.round(v * 10) / 10; };
    const a1 = ang(ex, ey);
    return [wrap(a1, side === "R" ? -260 : -100), wrap(ang(dx - ex, dy - ey) - a1, -180)];
  };
  const REST = { x: 0, y: 0, r: 0, sx: 1, head: 0, bob: 0, thL: 0, shL: 0, thR: 0, shR: 0, uaL: 8, faL: 0, uaR: -8, faR: 0 };
  const SIT = { bob: 11, thL: -84, shL: 84, thR: -78, shR: 78 };
  const STAND = { bob: 0, thL: 0, shL: 0, thR: 0, shR: 0 };
  const SQUAT = { bob: 11, thL: 45, thR: -45, shL: -90, shR: 90 };
  const THUMB = { uaR: -150, faR: 30 };
  const ARMS = { uaL: 8, faL: 0, uaR: -8, faR: 0 };

  const actor = (C, T, x0, { s = 1, cls = "", base = {} } = {}) => {
    const place = el("g", { transform: `translate(${x0} ${G}) scale(${s})` }, C);
    const mv = el("g", {}, place), hop = el("g", {}, mv), tip = el("g", {}, hop), flip = el("g", {}, tip);
    const m = person(0, 0, { cls: `sc-cast__man ${cls}` }, flip);
    const ch = {};
    let cx = x0;
    const expand = (p) => {
      const o = { ...p };
      if (o.hL) { [o.uaL, o.faL] = ik("L", ...o.hL); delete o.hL; }
      if (o.hR) { [o.uaR, o.faR] = ik("R", ...o.hR); delete o.hR; }
      return o;
    };
    const B = { ...REST, x: x0, ...expand(base) };
    const valAt = (k, t) => { let v = B[k], best = -1; (ch[k] || []).forEach(([kt, kv]) => { if (kt <= t && kt >= best) { best = kt; v = kv; } }); return v; };
    const a = {
      m, mv, hop, tip, flip, s, T, B,
      k(t, pose) { const p = expand(pose); for (const n in p) (ch[n] ||= []).push([t, p[n]]); if ("x" in p) cx = p.x; return a; },
      hold(t0, t1, pose) { a.k(t0, pose); return a.k(t1, pose); },
      // base pose back on the listed channels (all but x and y when none listed)
      rest(t, keys) { const p = {}; (keys || Object.keys(REST).filter((n) => n !== "x")).forEach((n) => { p[n] = B[n]; }); return a.k(t, p); },
      // channel n swings ±amp about where it is at t0, every period seconds
      wag(t0, t1, n, amp, period = 0.3) { const v = valAt(n, t0); let i = 0; for (let t = t0; t < t1 - period / 2; t += period, i++) (ch[n] ||= []).push([t, v + (i % 2 ? -amp : amp)]); (ch[n] ||= []).push([t1, v]); return a; },
      walk(t0, t1, x1, { stride = 0.22, arms = "LR", big = 1 } = {}) {
        const dir = x1 > cx ? -1 : 1, P = (t) => (t / T) * 100;
        const w = walk(P(t0), P(t1), dir, 0, arms !== "", P(stride) - P(0));
        // a walk starts from standing, arms hanging, whatever his resting pose
        ["thL", "shL", "thR", "shR", "bob"].forEach((n) => { (ch[n] ||= []).push([t0 - 0.06, REST[n]]); w[n].forEach(([p, v]) => ch[n].push([(p * T) / 100, v * big])); });
        [["L", "uaL", "faL"], ["R", "uaR", "faR"]].forEach(([S, u, f]) => {
          if (!arms.includes(S)) return;
          (ch[u] ||= []).push([t0 - 0.06, REST[u]]); (ch[f] ||= []).push([t0 - 0.06, 0]);
          w[u].forEach(([p, v]) => ch[u].push([(p * T) / 100, REST[u] + (v - REST[u]) * big]));
          w[f].forEach(([p, v]) => ch[f].push([(p * T) / 100, v * big]));
        });
        a.k(t0, { x: cx }); return a.k(t1, { x: x1 });
      },
      run(t0, t1, x1, o = {}) { return a.walk(t0, t1, x1, { stride: 0.13, big: 1.5, ...o }); },
      // a speech balloon above his head; it follows him but keeps its size
      say(text, t0, t1, { dy = -80 } = {}) {
        const g = el("g", { class: "sc-bub", transform: `translate(0 ${dy}) scale(${1 / s})` }, mv);
        const w = text.length * 6.4 + 12;
        el("path", { d: "M-3 5 L0 10 L3 5", class: "sc-bub__tail" }, g);
        el("rect", { x: -w / 2, y: -11, width: w, height: 16, rx: 3 }, g);
        el("text", { x: 0, y: 1 }, g).textContent = text;
        tk(g, "o", T, [[0, 0], [t0 - 0.02, 0], [t0 + 0.12, 1], [t1 - 0.12, 1], [t1, 0], [T, 0]]);
        return a;
      },
      // small rising glyphs: z for a nap, notes for the music
      float(glyph, t0, t1, { dx = 8, dy = -70, cls = "sc-zz" } = {}) {
        [0, 1, 2].forEach((i) => {
          const g = el("g", { transform: `translate(${dx + i * 5} ${dy}) scale(${1 / s})` }, mv);
          const n = el("text", { x: 0, y: 0, class: cls }, g);
          n.textContent = glyph;
          const ys = [[0, 0]], os = [[0, 0]];
          for (let t = t0 + i * 0.45; t + 1.1 < t1; t += 1.35) { ys.push([t, 0], [t + 1.1, -14], [t + 1.14, 0]); os.push([t - 0.02, 0], [t + 0.1, 1], [t + 0.8, 1], [t + 1.1, 0]); }
          ys.push([T, 0]); os.push([T, 0]);
          tk(n, "y", T, ys); tk(g, "o", T, os);
        });
        return a;
      },
      done() {
        const map = { x: [mv, "x"], y: [hop, "y"], r: [tip, "r"], sx: [flip, "sx"], head: [m.head, "r"], bob: [m.bob, "y"], uaL: [m.aL.up, "r"], faL: [m.aL.fore, "r"], uaR: [m.aR.up, "r"], faR: [m.aR.fore, "r"], thL: [m.lL.th, "r"], shL: [m.lL.sh, "r"], thR: [m.lR.th, "r"], shR: [m.lR.sh, "r"] };
        Object.keys(map).forEach((n) => {
          let fr = ch[n];
          if (!fr && B[n] === REST[n] && n !== "x") return;
          fr = fr ? [...fr] : [];
          if (!fr.some(([t]) => t <= 0)) fr.push([0, B[n]]);
          if (n === "x") fr = fr.map(([t, v]) => [t, (v - x0) / s]);
          fr = fr.filter(([t]) => t >= 0 && t <= T);
          const [node, kind] = map[n];
          tk(node, kind, T, fr, n === "x" ? { lin: true } : {});
        });
      },
    };
    return a;
  };
  const foreman = (C, T, x) => {
    const a = actor(C, T, x, { s: 1.08, cls: "sc-boss", base: { hL: [6, -38] } });
    a.m.bob.insertBefore(el("ellipse", { cx: 1.5, cy: -33, rx: 8.5, ry: 9, class: "sc-belly" }), a.m.bob.querySelector(".sc-band"));
    el("rect", { x: -3, y: 9, width: 7, height: 7, rx: 1, class: "sc-mug" }, a.m.aL.fore);
    return a;
  };
  const oldHand = (C, T, x, base = {}) => {
    const a = actor(C, T, x, { cls: "sc-old", base: { r: 3, ...base } });
    el("path", { d: "M-4.5 -3.5 q2.2 1.8 4.5 0 q2.3 1.8 4.5 0", class: "sc-stache" }, a.m.head);
    return a;
  };
  const rookie = (C, T, x, base = {}) => {
    const a = actor(C, T, x, { s: 0.86, cls: "sc-kid", base });
    const hm = a.m.head.querySelector(".sc-helmet");
    a.hg = el("g", {}, a.m.head); a.hg.append(hm); // too big a helmet, in a group of its own: it slips
    hm.setAttribute("transform", "translate(0 1) scale(1.22 1.15)");
    return a;
  };
  const headphones = (C, T, x, base = {}) => {
    const a = actor(C, T, x, { s: 0.96, cls: "sc-dj", base });
    el("path", { d: "M-8.5 -8 A9 9 0 0 1 8.5 -8", class: "sc-phones sc-phones__band" }, a.m.head);
    el("rect", { x: -10, y: -11, width: 3.5, height: 7, rx: 1, class: "sc-phones" }, a.m.head);
    el("rect", { x: 6.5, y: -11, width: 3.5, height: 7, rx: 1, class: "sc-phones" }, a.m.head);
    return a;
  };
  const chain = (parent, kinds) => { let g = parent; const o = {}; kinds.forEach((k) => { g = el("g", {}, g); o[k] = g; }); return o; };

  /* 00 the yard — "lift with your knees": the rookie runs in with too many
     boxes and drops one; the old hand wakes, shows him how, and puts it
     back; the foreman, on time to the minute, sends him on; a nap resumes */
  {
    const T = 60, C = castOf(0, T);
    el("rect", { x: 1514, y: 386, width: 32, height: 14, class: "sc-crate" }, C);
    const old = oldHand(C, T, 1530, { ...SIT, head: 18, hL: [5, -27], hR: [7, -27] });
    const kid = rookie(C, T, 1700, { hL: [8, -36], hR: [20, -36] });
    const boss = foreman(C, T, 1700);
    // the boxes, held at the chest; the top one has a life of its own
    const piv = el("g", { transform: "translate(14 -30)" }, kid.mv), wob = el("g", {}, piv);
    [-12, -22].forEach((y) => el("rect", { x: -6, y, width: 12, height: 10, class: "sc-box" }, wob));
    const top = chain(el("g", { transform: "translate(0 -27)" }, wob), ["x", "y", "r"]);
    el("rect", { x: -6, y: -5, width: 12, height: 10, class: "sc-box" }, top.r);
    tk(top.x, "x", T, [[0, 0], [9, 0], [9.35, 8], [9.9, 25.5], [24.2, 25.5], [25.6, 26.7], [26.6, 3.4], [27.6, 0], [T, 0]]);
    tk(top.y, "y", T, [[0, 0], [9, 0], [9.35, -6], [9.9, 52], [10.1, 48], [10.3, 52], [24.2, 52], [25.6, 17.5], [26.6, 17.5], [27.6, 0], [T, 0]]);
    tk(top.r, "r", T, [[0, 0], [9, 0], [9.35, 30], [9.9, 90], [24.2, 90], [25.6, 0], [T, 0]]);
    tk(wob, "r", T, [[0, 0], [6, 0], [6.4, 4], [6.9, -5], [7.4, 6], [7.9, -7], [8.4, 8], [9, 0], [38.6, 0], [38.9, -6], [39.3, 5], [39.7, 0], [T, 0]]);

    kid.run(2, 6, 1470, { arms: "" });
    kid.k(6, { r: 0 }).wag(6.2, 9, "r", 3, 0.5);
    kid.say("!", 9.1, 10.6).k(9.4, { head: 0 }).hold(9.8, 11, { head: 20 }).k(11.4, { head: -10 }).say("HELP?", 11.3, 13.2).k(13.4, { head: 0 });
    kid.wag(20.6, 22.8, "head", 8, 0.45).wag(28.6, 30.4, "head", 8, 0.4).say("THANKS!", 31.2, 33);
    kid.k(38.5, { y: 0 }).k(38.8, { y: -8 }).k(39.2, { y: 0 }).say("!", 38.7, 40);
    kid.run(42.4, 46, 1720, { arms: "" });

    old.float("z", 0, 12).k(12, { head: 18 }).k(12.6, { head: -6 }).say("?", 12.4, 13.8);
    old.k(13.8, { ...SIT, hL: [5, -27], hR: [7, -27] }).k(16.4, { ...STAND, hL: [-7, -30, "out"], r: 6, head: 0 }).say("UGH", 14.6, 16.4);
    old.walk(16.8, 18.6, 1520, { stride: 0.34, arms: "R" });
    old.k(19.6, { hL: [-7, -30, "out"] }).k(20.4, { hL: [-18, -40], hR: [7, -30, "out"], r: 3 }).wag(20.6, 22.4, "faL", 16, 0.3).say("KNEES!", 20.6, 22.8);
    old.k(22.8, { ...STAND, hR: [-8, -30], hL: [-6, -30] }).k(24.2, { ...SQUAT, hR: [-14, -12], hL: [-10, -12], r: 6 });
    old.k(25.6, { ...STAND, hR: [-15, -34], hL: [-11, -34], r: 3 });
    old.walk(25.6, 26.6, 1500, { arms: "", stride: 0.25 });
    old.k(26.6, { hR: [-15, -34], hL: [-11, -34] }).k(27.6, { hR: [-18, -48], hL: [-14, -48] });
    old.k(28.4, { hL: [-7, -30, "out"], uaR: -8, faR: 0 }).hold(29, 30.4, THUMB).k(30.8, { uaR: -8, faR: 0 }).say("SEE?", 29, 31);
    old.walk(31, 34.4, 1530, { stride: 0.34, arms: "R" });
    old.k(34.6, { ...STAND, r: 3, head: 0, hL: [-7, -30, "out"] }).k(36.4, { ...SIT, head: 18, hL: [5, -27], hR: [7, -27], r: 3 });
    old.float("z", 37, 60).k(53, { hR: [7, -27] }).hold(53.6, 55, THUMB).k(55.6, { hR: [7, -27] });

    boss.walk(32, 36, 1568, { arms: "R" });
    boss.k(36.2, { hR: [-4, -44, "out"], head: 16 }).k(38.6, { hR: [-4, -44, "out"], head: 16 }).say("08:00!", 36.8, 39);
    boss.hold(39.4, 41.8, { hR: [22, -52], head: 0 }).k(42.4, { uaR: -8, faR: 0 }).say("GO GO GO", 40, 42.2);
    boss.hold(46, 47.6, { head: -14 }).k(48.6, { hL: [3, -57], head: -8 }).k(49.6, { hL: [3, -57], head: -8 }).k(50.2, { hL: [6, -38], head: 0 });
    boss.wag(50.4, 52.4, "head", 10, 0.35).say("…", 50.4, 52.6);
    boss.walk(53, 58.5, 1720, { arms: "R" });
    [old, kid, boss].forEach((a) => a.done());
  }

  /* 01 services — the one with the headphones sweeps to his own music and
     plays the broom; the foreman catches him, then, when no one is looking,
     dances too; caught in turn, he clears his throat and goes */
  {
    const T = 56, C = castOf(1, T);
    const dj = headphones(C, T, 960, { hR: [10, -30], hL: [4, -38] });
    el("path", { d: "M0 9 L-6 40 M-12 40 h12", class: "sc-broom" }, dj.m.aR.fore);
    const boss = foreman(C, T, 1720);
    const sweep = (a, t0, t1, p = 0.5, wide = 5) => { for (let t = t0, i = 0; t < t1 - p / 2; t += p, i++) a.k(t, { hR: [i % 2 ? 10 + wide : 10 - wide, -30] }); return a.k(t1, { hR: [10, -30] }); };
    const groove = (a, t0, t1, p = 0.5) => a.wag(t0, t1, "head", 7, p).wag(t0, t1, "bob", 1.2, p);
    const guitar = (a, t0, t1) => { a.k(t0, { hR: [8, -40], hL: [-14, -52], r: -4 }); a.wag(t0 + 0.2, t1 - 0.2, "faR", 18, 0.18).wag(t0 + 0.2, t1 - 0.2, "r", 4, 0.5); return a.k(t1, { hR: [10, -30], hL: [4, -38], r: 0 }); };

    dj.walk(0.2, 12, 1060, { stride: 0.32, arms: "" }); sweep(dj, 0.2, 12); dj.wag(0, 12, "head", 7, 0.5).float("♪", 0, 15, { cls: "sc-note" });
    guitar(dj, 12.2, 15.4);
    sweep(dj, 15.6, 19.4); groove(dj, 15.6, 22);
    dj.k(19.5, { sx: 1 }).k(19.9, { sx: -1 }).k(20.3, { sx: 1 });
    dj.k(22.3, { y: 0 }).k(22.6, { y: -7 }).k(23, { y: 0 }).say("!", 22.5, 24);
    sweep(dj, 24, 28, 0.15, 7); dj.hold(24, 28, { head: 14 });
    sweep(dj, 28.2, 33); dj.k(33.2, { head: -16 }).say("?!", 33.4, 34.8);
    guitar(dj, 35, 40).float("♪", 35, 40.2, { cls: "sc-note" });
    dj.hold(40.6, 44.6, { head: 10 }).wag(43.2, 44.6, "head", 6, 0.35);
    dj.walk(45, 51, 960, { stride: 0.32, arms: "" }); sweep(dj, 45, 51); dj.wag(45, 56, "head", 7, 0.5).wag(51.2, 56, "bob", 1.2, 0.5).float("♪", 46, 56, { cls: "sc-note" });
    dj.hold(51.4, 52.8, THUMB); sweep(dj, 53, 56);

    boss.walk(14, 19, 1290, { arms: "R" });
    boss.k(19.4, { hR: [9, -29, "out"], head: 8 }).k(26, { hR: [9, -29, "out"], head: 8 }).say("…", 19.6, 22).wag(26, 27.6, "head", 9, 0.4);
    boss.k(28.2, { hL: [3, -57], head: -8 }).k(29.2, { hL: [3, -57] }).k(29.8, { hL: [6, -38], head: -18, uaR: -8, faR: 0 });
    boss.wag(30.4, 35, "thR", 14, 0.35).wag(30.4, 40, "bob", 1.5, 0.35).wag(30.4, 40, "head", 6, 0.35).float("♪", 31, 40, { cls: "sc-note" });
    boss.k(35, { hR: [8, -56] }).wag(35.2, 40, "uaR", 14, 0.35);
    boss.k(40.4, { ...STAND, uaR: -8, faR: 0, head: 0, r: 0 }).say("AHEM", 40.6, 42.6);
    boss.hold(43, 45, { hR: [-22, -34] }).k(45.4, { uaR: -8, faR: 0 });
    boss.walk(46, 51.5, 1720, { arms: "R" });
    [dj, boss].forEach((a) => a.done());
  }

  /* 02 projects — measuring up: the rookie holds the tape, the old hand
     walks it out; the rookie lets go, twice; a helmet over the eyes, a
     stand walked into, a helmet put right, and a handshake */
  {
    const T = 60, C = castOf(2, T);
    const kid = rookie(C, T, 1340, { hR: [10, -34] });
    const old = oldHand(C, T, 1365, { hL: [-10, -29] });
    el("circle", { cx: 0, cy: 12, r: 3, class: "sc-reel" }, old.m.aL.fore);
    const X0 = 1348.6, len = (ox) => Math.max(0.01, ox - 10 - X0);
    const tape = chain(el("g", { transform: `translate(${X0} 370.6)` }, C), ["o", "x", "sx"]);
    el("rect", { x: 0, y: -0.6, width: 1, height: 1.2, class: "sc-tape" }, tape.sx);
    tk(tape.x, "x", T, [[0, 0], [12.2, 0], [12.5, 186.4], [24.4, 186.4], [24.6, 0], [35.2, 0], [35.5, 186.4], [58.6, 186.4], [58.8, 0], [T, 0]], { lin: true });
    tk(tape.sx, "sx", T, [[0, len(1365)], [2, len(1365)], [9, len(1545)], [12.2, len(1545)], [12.5, 0.01], [24.6, len(1372)], [24.8, len(1372)], [31.8, len(1545)], [35.2, len(1545)], [35.5, 0.01], [58.8, len(1365)], [T, len(1365)]], { lin: true });
    tk(tape.o, "o", T, [[0, 1], [12.5, 1], [12.6, 0], [24.5, 0], [24.6, 1], [35.5, 1], [35.6, 0], [58.7, 0], [58.8, 1], [T, 1]]);

    old.walk(2, 9, 1545, { stride: 0.3, arms: "R" });
    old.hold(9.2, 12, { head: 20 }).say("HM…", 9.4, 11.6);
    old.k(12.2, { r: 3, y: 0 }).k(12.45, { r: -10, y: -5 }).k(13, { r: 3, y: 0, head: 0 }).say("!!", 12.5, 14);
    old.walk(14.2, 18.4, 1372, { stride: 0.2, arms: "R" });
    old.k(19, { hR: [16, -58] }).wag(19.2, 22.6, "faR", 20, 0.3).k(23, { uaR: -8, faR: 0 }).say("HOLD IT!", 19.4, 22);
    old.walk(24.8, 31.8, 1545, { stride: 0.3, arms: "R" });
    old.hold(32, 34.6, { head: 20 }).say("12.40 m", 32.2, 34.6).k(34.8, { head: 0 }).hold(35, 36, THUMB);
    old.k(36.4, { hR: [3, -60] }).k(38.2, { hR: [3, -60] }).k(38.6, { uaR: -8, faR: 0 }).say("…", 36.4, 38.6);
    old.walk(39, 43.6, 1324, { stride: 0.22, arms: "R" });
    old.k(44.6, { hR: [-18, -54] }).wag(45.4, 46.6, "faR", 10, 0.3).k(47, { uaR: -8, faR: 0 }).say("THERE.", 45.4, 47.4);
    old.walk(50.4, 55.4, 1365, { stride: 0.3, arms: "R" });
    old.k(56.2, { hR: [-13, -34] }).wag(56.6, 58.2, "faR", 8, 0.25).k(58.8, { uaR: -8, faR: 0 });

    kid.k(11.6, { hR: [10, -34] }).hold(12, 12.5, { hR: [3, -58] }).k(12.9, { hR: [10, -26] }).say("OOPS", 12.8, 14.6);
    kid.hold(19, 22.4, { head: 18 }).hold(22.8, 24, { hR: [4, -63, "out"], head: 0 }).say("YES SIR!", 22.8, 24.4).k(24.6, { hR: [10, -34] });
    kid.k(35.1, { hR: [10, -34] }).k(35.4, { hR: [8, -68], hL: [-8, -68], y: 0 }).k(35.7, { y: -10 }).k(36.1, { y: 0 }).k(36.5, { y: -10 }).k(36.9, { y: 0 });
    tk(kid.hg, "y", T, [[0, 0], [36.6, 0], [36.85, 5], [45.2, 5], [45.6, 0], [T, 0]]);
    kid.k(37.4, { hL: [18, -46], hR: [20, -48] });
    kid.walk(37.6, 41, 1306, { stride: 0.3, arms: "" });
    kid.k(41, { r: 0, y: 0 }).k(41.25, { r: -8, y: -3 }).k(41.8, { r: 0, y: 0 }).say("OW", 41.2, 42.8).k(42.2, { ...ARMS });
    kid.hold(46, 47.6, THUMB).k(48, { ...ARMS }).say("THX!", 47.6, 49);
    kid.walk(50, 55, 1340, { stride: 0.22, arms: "LR" });
    kid.k(56.2, { hR: [12, -40] }).wag(56.6, 58.2, "faR", 8, 0.25).k(58.9, { hR: [10, -34] });
    [kid, old].forEach((a) => a.done());
  }

  /* 03 careers — first day nerves: the rookie rehearses his hello; the old
     hand, on a crate with his thermos, laughs, shows him how to be cool; the
     rookie overdoes it and falls flat, sets off for the recruiter, loses his
     nerve halfway and is sent back out */
  {
    const T = 56, C = castOf(3, T);
    el("rect", { x: 144, y: 386, width: 32, height: 14, class: "sc-crate" }, C);
    const old = oldHand(C, T, 160, { ...SIT, hL: [5, -27], hR: [7, -27] });
    el("rect", { x: -3, y: 6, width: 6, height: 12, rx: 1.5, class: "sc-mug" }, old.m.aL.fore); // the thermos
    const kid = rookie(C, T, 330);
    const sip = (a, t) => a.k(t, { hL: [5, -27] }).k(t + 0.5, { hL: [3, -57], head: -8 }).k(t + 1.2, { hL: [3, -57], head: -8 }).k(t + 1.7, { hL: [5, -27], head: 0 });
    sip(old, 2); sip(old, 6.4);
    old.k(14.4, { head: -10 }).wag(14.4, 17, "bob", 1.6, 0.15).say("HA!", 14.6, 16.6).k(17, { head: 0 });
    old.k(17.2, { hR: [14, -50] }).wag(17.4, 19.4, "faR", 25, 0.3).k(19.8, { hR: [7, -27] });
    old.k(20.2, { r: -10, hL: [6, -40], hR: [-6, -42] }).k(24.6, { r: -10, hL: [6, -40], hR: [-6, -42] }).k(25.2, { r: 3, hL: [5, -27], hR: [7, -27] }).say("RELAX.", 20.4, 23);
    old.k(27.4, { head: -10 }).wag(27.4, 30, "bob", 1.6, 0.15).say("HA HA", 27.6, 30).k(30.2, { head: 0 });
    old.hold(45.6, 47.6, { hR: [22, -50] }).k(48, { hR: [7, -27] }).say("GO.", 45.8, 48);
    sip(old, 50.4);

    kid.walk(0, 1.8, 380, { stride: 0.22 }).walk(2.2, 4, 330, { stride: 0.22 }).hold(0, 4, { head: 15 });
    kid.k(4.4, { r: 0, head: 0 }).hold(5, 6.2, { r: 28 }).k(6.8, { r: 0 }).say("HELLO, SIR!", 4.6, 7);
    kid.k(7.6, { hR: [20, -40] }).wag(7.8, 10.6, "faR", 12, 0.2).k(11, { ...ARMS }).say("I'M READY", 8, 10.8);
    kid.k(11.4, { ...THUMB, uaL: 150, faL: -30, y: 0 }).k(11.8, { y: -8 }).k(12.2, { y: 0 }).k(12.6, { y: -8 }).k(13, { y: 0 }).k(13.6, { ...ARMS });
    kid.walk(17, 20, 200, { stride: 0.24 });
    kid.wag(20.4, 24.4, "head", 7, 0.5);
    kid.k(25.2, { r: 10, hL: [6, -40], hR: [-6, -42] }).k(26.2, { r: 22 }).k(26.6, { r: 90 }).say("WHOA", 25.6, 27).wag(27, 28.2, "uaR", 30, 0.2);
    kid.k(30, { r: 90, ...ARMS }).k(31.4, { r: 0 });
    kid.k(32, { hR: [5, -27], hL: [-6, -30] }).wag(32.2, 33.8, "faR", 20, 0.15).k(34, { ...ARMS });
    kid.walk(34.2, 38, 450, { stride: 0.2, big: 1.3 }).k(34.4, { r: -3 }).k(38, { r: -3 });
    kid.k(38.2, { r: 0, head: 14 }).k(40.4, { head: 14 }).say("…", 38.4, 40.4);
    kid.run(40.6, 43.8, 230).k(43.8, { head: 0 }).say("LATER?", 43.9, 45.4).hold(45.6, 48, { head: 16 });
    kid.walk(48.2, 53, 330, { stride: 0.3 }).k(53, { head: 15 });
    kid.k(53.4, { bob: -1.5, hL: [-14, -44], hR: [14, -44], head: -6 }).k(55, { bob: 0, ...ARMS, head: 15 });
    [old, kid].forEach((a) => a.done());
  }

  /* 04 contact — notes by paper plane: the first nose-dives, the second
     makes it to the old hand, who laughs and sends one back with a loop
     that lands on the rookie's helmet; the foreman pockets the crashed one */
  {
    const T = 56, C = castOf(4, T);
    el("rect", { x: 284, y: 386, width: 32, height: 14, class: "sc-crate" }, C);
    const kid = rookie(C, T, 1320, { hL: [10, -36], hR: [8, -40], head: 16 });
    const old = oldHand(C, T, 300, { ...SIT, hL: [5, -27], hR: [7, -27] });
    const boss = foreman(C, T, 1720);
    const plane = () => { const p = chain(C, ["o", "x", "y", "r", "sx"]); el("path", { d: "M-9 0 L8 -4 L5 0 L8 3 Z M-9 0 L5 0", class: "sc-plane" }, p.sx); return p; };
    const p1 = plane(), p2 = plane();
    const HAND = [1329.5, 365.6];
    tk(p1.o, "o", T, [[0, 0], [5.7, 0], [5.8, 1], [46.5, 1], [46.6, 0], [T, 0]]);
    tk(p1.x, "x", T, [[0, HAND[0]], [6, HAND[0]], [7, 1310], [7.3, 1339], [7.8, 1270], [8.6, 1225], [9.4, 1190], [42, 1190], [43.4, 1198], [46.5, 1198], [50, HAND[0]], [T, HAND[0]]], { lin: true });
    tk(p1.y, "y", T, [[0, HAND[1]], [6, HAND[1]], [7, 350], [7.3, 352], [7.8, 330], [8.6, 345], [9.4, 396], [9.6, 392], [9.8, 396], [42, 396], [43.4, 346], [46.5, 346], [50, HAND[1]], [T, HAND[1]]]);
    tk(p1.r, "r", T, [[0, 0], [7.3, 10], [7.8, 0], [8.6, -35], [9.4, -20], [42, -20], [43.4, 0], [T, 0]]);
    tk(p2.o, "o", T, [[0, 0], [13.7, 0], [13.8, 1], [38.9, 1], [39, 0], [T, 0]]);
    tk(p2.x, "x", T, [[0, HAND[0]], [14, HAND[0]], [14.8, 1310], [15, 1339], [16.4, 1000], [17.6, 700], [18.7, 450], [19.6, 316], [21, 316], [21.4, 310], [26.6, 310], [29, 290], [30, 320], [31.6, 760], [31.9, 800], [32.2, 830], [32.5, 800], [32.8, 770], [33.1, 800], [34.2, 1100], [35, 1318], [36.8, 1318], [37.4, 1330], [38.9, 1330], [44, HAND[0]], [T, HAND[0]]], { lin: true });
    tk(p2.y, "y", T, [[0, HAND[1]], [14, HAND[1]], [14.8, 350], [15, 352], [16.4, 260], [17.6, 240], [18.7, 300], [19.6, 350], [21, 350], [21.4, 352], [26.6, 352], [29, 340], [30, 344], [31, 290], [31.6, 280], [31.9, 280], [32.2, 250], [32.5, 220], [32.8, 250], [33.1, 280], [34.2, 300], [35, 336], [36.8, 336], [37.4, 365], [38.9, 365], [44, HAND[1]], [T, HAND[1]]]);
    tk(p2.r, "r", T, [[0, 0], [15, 12], [16.4, 4], [17.6, 0], [18.7, -8], [19.6, -12], [21.4, 0], [30, -10], [31.6, 0], [31.9, -45], [32.2, -90], [32.5, -180], [32.8, -270], [33.1, -360], [34.2, -365], [35, -350], [36.8, -350], [37.4, -360], [44, -360], [44.1, 0], [T, 0]]);
    tk(p2.sx, "sx", T, [[0, 1], [28, 1], [28.1, -1], [39, -1], [39.1, 1], [T, 1]]);

    const write = (t0, t1) => kid.k(t0, { hL: [10, -36], hR: [8, -40], head: 16 }).wag(t0 + 0.1, t1, "faR", 10, 0.2);
    const fold = (t0, t1) => kid.k(t0, { hL: [10, -40], hR: [12, -40], head: 12 }).wag(t0 + 0.1, t1, "faL", 15, 0.25);
    write(0, 4); fold(4, 6);
    kid.k(6.6, { hR: [-12, -58], head: 0 }).k(7.3, { hR: [22, -56] }).k(8, { ...ARMS }).k(9.4, { head: 10 });
    kid.hold(9.6, 11.4, { hL: [3, -60] }).say("UGH", 9.7, 11.6);
    fold(11.8, 14);
    kid.k(14.6, { hR: [-12, -58], head: 0 }).k(15, { hR: [22, -56] }).k(15.8, { ...ARMS }).hold(16, 19.6, { head: -8 });
    kid.say("?", 35.2, 36.6).k(36.2, { ...ARMS }).k(36.8, { hR: [2, -70] }).k(37.4, { hR: [10, -40], hL: [8, -40], head: 16 }).k(38.9, { head: 16 });
    kid.k(39.1, { hR: [8, -68], hL: [-8, -68], head: 0, y: 0 }).k(39.4, { y: -10 }).k(39.8, { y: 0 }).k(40.2, { y: -10 }).k(40.6, { y: 0 }).say("YES!", 39.2, 41.4);
    kid.k(42, { hR: [10, -66], hL: [8, -36] }).wag(42.2, 45, "faR", 25, 0.3).k(45.4, { ...ARMS });
    write(46, 56);

    old.k(19, { hR: [8, -40] }).k(19.5, { hR: [16, -61] }).k(21, { hR: [16, -61] }).say("!", 19.7, 21);
    old.hold(21.4, 24, { hR: [8, -58], hL: [4, -52], head: 12 });
    old.k(24.2, { head: -10 }).wag(24.2, 26.4, "bob", 1.6, 0.15).say("HA!", 24.2, 26.2);
    old.k(26.6, { hL: [8, -44], hR: [10, -44], head: 10 }).wag(26.8, 28.8, "faL", 15, 0.25);
    old.k(29.2, { hR: [-10, -58], head: 0 }).k(30, { hR: [20, -58] }).k(30.8, { hL: [5, -27], hR: [7, -27] });
    old.k(42.6, { hR: [10, -80] }).wag(42.8, 45.6, "faR", 25, 0.3).k(46, { hR: [7, -27] });

    boss.walk(34, 41.6, 1202, { arms: "R" });
    boss.k(42, { ...STAND }).k(42.8, { ...SQUAT, hR: [-12, -12] }).k(43.4, { ...STAND, hR: [-4, -50] }).hold(43.6, 46.2, { hR: [-4, -50], head: 16 });
    boss.say("HEH", 44.6, 46.4).k(46.6, { uaR: -8, faR: 0, head: 0 });
    boss.walk(47, 54.4, 1720, { arms: "R" });
    [kid, old, boss].forEach((a) => a.done());
  }

  /* 05 the end — a curtain call: the four come on, bow; the rookie bows
     too deep and his helmet rolls off, he chases it; they bow again, wave,
     a spin from the headphones, and off they go to lunch */
  {
    const T = 60, C = castOf(5, T);
    const boss = foreman(C, T, 1720), old = oldHand(C, T, 1720), dj = headphones(C, T, 1720), kid = rookie(C, T, 1720);
    boss.walk(0, 6, 1440, { arms: "R" });
    old.walk(2, 9.4, 1480, { stride: 0.32, arms: "R" });
    dj.walk(4, 9, 1520).wag(4, 9, "head", 7, 0.5).float("♪", 4, 9.4, { cls: "sc-note" });
    kid.run(6.4, 9.2, 1565);
    boss.hold(10, 11.8, { hR: [6, -66] }).k(12.1, { uaR: -8, faR: 0 }).say("AND…", 10.2, 12);
    const bow = (a, t, deg = -28) => a.k(t, { r: a.B.r }).hold(t + 0.6, t + 1.4, { r: deg }).k(t + 2, { r: a.B.r });
    [boss, old, dj].forEach((a) => bow(a, 12));
    kid.k(12, { r: 0 }).k(12.7, { r: -62 }).k(13.4, { r: -62 }).k(14, { r: 0 }).say("!", 13.2, 14.6);
    tk(kid.hg, "o", T, [[0, 1], [12.85, 1], [12.9, 0], [18, 0], [18.1, 1], [T, 1]]);
    const hel = chain(C, ["o", "x", "y", "r"]);
    el("path", { d: "M-9 0 A9 9 0 0 1 9 0 Z M-12 0 H12", class: "sc-helmet sc-hel" }, hel.r);
    tk(hel.o, "o", T, [[0, 0], [12.85, 0], [12.9, 1], [16.4, 1], [16.5, 0], [T, 0]]);
    tk(hel.x, "x", T, [[0, 1519], [12.9, 1519], [13.4, 1514], [13.7, 1522], [16.4, 1700], [T, 1519]], { lin: true });
    tk(hel.y, "y", T, [[0, 372], [12.9, 372], [13.4, 398], [13.55, 392], [13.7, 398], [T, 372]]);
    tk(hel.r, "r", T, [[0, -62], [12.9, -62], [13.4, -150], [13.7, -180], [16.4, 360], [T, -62]]);
    kid.run(14.4, 17.4, 1720);
    [boss, old, dj].forEach((a) => a.hold(14, 16.4, { head: 14 }).k(16.8, { head: 0 }));
    boss.k(19, { hL: [-14, -44, "out"], hR: [14, -44, "out"] }).k(21, { hL: [-14, -44, "out"], hR: [14, -44, "out"] }).k(21.4, { hL: [6, -38], uaR: -8, faR: 0 });
    old.k(19.4, { head: -10 }).wag(19.4, 21.8, "bob", 1.6, 0.15).say("HA!", 19.6, 21.6).k(22, { head: 0 });
    dj.wag(19, 22, "head", 7, 0.4).wag(19, 22, "bob", 1.2, 0.4).float("♪", 19, 22.4, { cls: "sc-note" });
    kid.run(22, 25.4, 1565).say("SORRY!", 25.4, 27.2);
    [boss, old, dj].forEach((a) => bow(a, 27.6));
    kid.k(27.4, { hL: [2, -70] }).k(27.6, { r: 0 }).hold(28.2, 29.4, { r: -28 }).k(30, { r: 0, ...ARMS });
    [boss, old, dj, kid].forEach((a, i) => a.k(30.6 + i * 0.15, { hR: [10, -66] }).wag(30.8 + i * 0.15, 33.6, "faR", 25, 0.3).k(34, { uaR: -8, faR: 0 }));
    boss.say("THANK YOU!", 30.8, 33.6);
    dj.k(34.6, { sx: 1 }).k(35, { sx: -1 }).k(35.4, { sx: 1 }).k(35.8, { sx: -1 }).k(36.2, { sx: 1 }).wag(34.4, 38, "bob", 1.4, 0.3).float("♪", 34, 38.2, { cls: "sc-note" });
    [boss, old, kid].forEach((a) => a.k(34.4, { hL: [6, -42], hR: [10, -42] }).wag(34.6, 37.8, "uaR", 10, 0.25).k(38, { ...a === boss ? { hL: [6, -38] } : { uaL: 8, faL: 0 }, uaR: -8, faR: 0 }));
    old.hold(38.4, 40.8, { hR: [-4, -44, "out"], head: 16 }).k(41.2, { uaR: -8, faR: 0, head: 0 }).say("LUNCH?", 38.6, 41);
    kid.run(41.2, 43.6, 1720);
    dj.walk(41.6, 46, 1720).wag(41.6, 46, "head", 7, 0.5);
    old.walk(42.6, 50, 1720, { stride: 0.32, arms: "R" });
    boss.k(44, { hR: [10, -66] }).wag(44.2, 45.6, "faR", 25, 0.3).k(45.9, { uaR: -8, faR: 0 });
    boss.walk(46, 51, 1720, { arms: "R" });
    [boss, old, dj, kid].forEach((a) => a.done());
  }

  const SHOT = { 0: { x: 400, h: 240 }, 1: { x: 512, h: 200 }, 2: { x: 770, h: 250 }, 3: { x: 1250, h: 210 }, 4: { x: 560, h: 190 }, 5: { x: 1050, h: 210 } };
  const STRIP = 150; // px
  const phone = () => innerWidth < 1100;
  const aim = () => {
    if (!phone()) { svg.setAttribute("viewBox", "0 0 1600 420"); return; }
    const st = (wrapEl && wrapEl.dataset.step) || "0", shot = SHOT[st] || SHOT[0];
    const w = shot.h * (host.clientWidth / STRIP);
    svg.setAttribute("viewBox", `${(shot.x - w * 0.3).toFixed(1)} ${420 - shot.h} ${w.toFixed(1)} ${shot.h}`);
  };
  /* hiring day, late start: when the recruiter lands, the queue is served one by one —
     a helmet each, then off through the gate, the others stepping up — and then
     the day carries on as usual */
  host.addEventListener("runner:arrived", (e) => {
    if (e.detail.step !== "3") return;
    const L = e.detail.layer, q = [...L.querySelectorAll(".sc-queuer")];
    if (!q.length || !q[0].animate) return;
    L.classList.add("is-serving");
    const anims = [];
    const GAP = 1.9;
    q.forEach((m, i) => {
      const x0 = +m.dataset.qx, until = i * GAP; // his turn
      const moves = [{ translate: "0px 0px", offset: 0 }];
      const total = until + 0.6 + 3.4;
      for (let k = 0; k < i; k++) moves.push({ translate: `${(k + 1) * 46}px 0px`, offset: Math.min(0.99, (k * GAP + 0.9) / total) });
      const at = x0 + i * 46;
      moves.push({ translate: `${i * 46}px 0px`, offset: Math.min(0.99, (until + 0.6) / total) });
      moves.push({ translate: `${1760 - x0}px 0px`, offset: 1 });
      anims.push(m.animate(moves, { duration: total * 1000, fill: "forwards", easing: "linear" }));
      const helm = m.querySelector(".sc-qhelmet");
      anims.push(helm.animate([{ opacity: 0 }, { opacity: 0, offset: Math.max(0.01, (until + 0.3) / total) }, { opacity: 1, offset: Math.min(0.99, (until + 0.4) / total) }, { opacity: 1 }], { duration: total * 1000, fill: "forwards" }));
      // legs walk while he moves on
      m.querySelectorAll(".sc-leg").forEach((leg, li) => anims.push(leg.animate(
        [{ transform: `rotate(${li % 2 ? -18 : 18}deg)` }, { transform: `rotate(${li % 2 ? 18 : -18}deg)` }],
        { duration: 300, iterations: Math.ceil(3400 / 300), direction: "alternate", delay: (until + 0.6) * 1000 })));
      void at;
    });
    setTimeout(() => {
      L.classList.remove("is-serving");
      anims.forEach((a) => a.cancel());
    }, ((q.length - 1) * GAP + 4.2) * 1000);
  });

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
