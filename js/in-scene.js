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
  const ink = el("g", { class: "sc-ink" }, svg);
  const props = el("g", { class: "sc-props" }, svg); // beams that move: drawn in ink, above the structure
  const crew = el("g", { class: "sc-crew" }, svg);
  const G = 400; // ground line
  const beam = (x, y, len, parent, cls = "sc-beam") => el("path", { d: `M${x} ${y}h${len} M${x} ${y + 6}h${len} M${x} ${y}v6 M${x + len} ${y}v6`, class: cls }, parent);

  /* ── structure ─────────────────────────────────────────── */
  // the ground runs past the drawing both ways, so a scaled-down scene still meets the screen edges
  el("line", { x1: -1600, y1: G, x2: 3200, y2: G, class: "sc-ground" }, ink);
  for (let x = -1600; x < 3200; x += 14) el("line", { x1: x, y1: G + 2, x2: x - 10, y2: G + 12, class: "sc-hatch" }, ink);

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
  const steps = el("g", { class: "sc-steps" }, svg);
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
  const track = (node, kind, frames) => {
    const name = `sc-k${uid++}`;
    const fmt = kind === "r" ? (v) => `transform: rotate(${v}deg)` : kind === "y" ? (v) => `transform: translateY(${v}px)` : (v) => `opacity: ${v}`;
    const seen = new Map();
    frames.forEach(([p, v]) => seen.set(Math.max(0, Math.min(100, +p.toFixed(2))), v));
    if (!seen.has(0)) seen.set(0, frames[0][1]);
    if (!seen.has(100)) seen.set(100, seen.get(0));
    const body = [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([p, v]) => `${p}% { ${fmt(v)}; animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1); }`).join(" ");
    sheet.push(`@keyframes ${name} { ${body} }`);
    node.style.animationName = name;
    node.classList.add("sc-tl");
  };
  const merge = (...lists) => lists.flat();
  const hold = (a, b, v) => [[a, v], [b, v]];

  /* a walk: stride every 0.75 % (0.225 s), knee bending on the back leg, body
     rising as the legs pass; dir +1 walks left, -1 walks right */
  const walk = (a, b, dir, phase, armsSwing) => {
    const out = { thL: [], shL: [], thR: [], shR: [], bob: [], uaL: [], faL: [], uaR: [], faR: [] };
    let i = phase;
    for (let t = a; t <= b - 0.75; t += 0.75, i++) {
      const s = i % 2 ? 1 : -1; // which leg leads
      const m = t + 0.375;
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
    if (getComputedStyle(host).display === "none") { wrap.style.removeProperty("--scene-h"); wrap.style.removeProperty("--h1-fit"); return; }
    const k = Math.min(wrap.clientWidth / 1600, 1.15);
    host.style.height = 420 * k + "px";
    const sceneH = 250 * k + 20;
    wrap.style.setProperty("--scene-h", sceneH + "px");
    const head = wrap.querySelector(".in-head"), paths = wrap.querySelector(".in-paths");
    const room = wrap.clientHeight - head.offsetHeight - sceneH - paths.offsetHeight - 48 - 24; // gap + breathing room
    wrap.style.setProperty("--h1-fit", Math.max(28, room / 2.85) + "px");
  };
  if (wrap) { new ResizeObserver(fit).observe(wrap); fit(); }

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
    const link = el("a", { href: `careers.html?trade=${encodeURIComponent(c.trade)}#apply`, class: "sc-call__a" }, tag);
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
