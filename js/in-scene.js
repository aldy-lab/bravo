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
  const svg = el("svg", { viewBox: "0 0 1600 420", preserveAspectRatio: "xMidYMax slice" }, host);
  const ink = el("g", { class: "sc-ink" }, svg);
  const props = el("g", { class: "sc-props" }, svg); // beams that move: drawn in ink, above the structure
  const crew = el("g", { class: "sc-crew" }, svg);
  const G = 400; // ground line
  const beam = (x, y, len, parent, cls = "sc-beam") => el("path", { d: `M${x} ${y}h${len} M${x} ${y + 6}h${len} M${x} ${y}v6 M${x + len} ${y}v6`, class: cls }, parent);

  /* ── structure ─────────────────────────────────────────── */
  el("line", { x1: 0, y1: G, x2: 1600, y2: G, class: "sc-ground" }, ink);
  for (let x = 0; x < 1600; x += 14) el("line", { x1: x, y1: G + 2, x2: x - 10, y2: G + 12, class: "sc-hatch" }, ink);

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

  /* ── people ───────────────────────────────────────────── */
  const person = (x, y, { armL = 12, armR = -12, legL = 6, legR = -6, cls = "" } = {}, parent = crew) => {
    const g = el("g", { class: "sc-man " + cls, transform: `translate(${x} ${y})` }, parent);
    const limb = (jx, jy, len, ang, name) => {
      const j = el("g", { transform: `translate(${jx} ${jy})` }, g);
      const l = el("g", { class: name, style: `--a:${ang}deg` }, j);
      el("line", { x1: 0, y1: 0, x2: 0, y2: len }, l);
      return l;
    };
    const back = limb(0, -48, 21, armL, "sc-arm sc-arm--l");
    limb(-2, -25, 25, legL, "sc-leg sc-leg--l");
    limb(2, -25, 25, legR, "sc-leg sc-leg--r");
    el("rect", { x: -7, y: -54, width: 14, height: 31, rx: 4, class: "sc-body" }, g);
    el("line", { x1: -7, y1: -40, x2: 7, y2: -40, class: "sc-band" }, g);
    el("line", { x1: -7, y1: -33, x2: 7, y2: -33, class: "sc-band" }, g);
    const front = limb(0, -48, 21, armR, "sc-arm sc-arm--r");
    el("circle", { cx: 0, cy: -61, r: 6, class: "sc-head" }, g);
    el("path", { d: "M-7.5 -62 A7.5 7.5 0 0 1 7.5 -62 Z M-10 -62 H10", class: "sc-helmet" }, g);
    return { g, aL: back, aR: front };
  };

  // welder on the scaffold, torch to the block's corner seam
  const wx = sx + 20;
  const w = person(wx, PL, { armL: 52, armR: 80, legL: 10, legR: -6, cls: "sc-welder" });
  el("line", { x1: 0, y1: 20, x2: 0, y2: 28, class: "sc-tool" }, w.aR);
  const tip = [wx - 28 * Math.sin(80 * Math.PI / 180), PL - 48 + 28 * Math.cos(80 * Math.PI / 180)];
  const sparks = el("g", { class: "sc-sparks", transform: `translate(${tip[0].toFixed(1)} ${tip[1].toFixed(1)})` }, crew);
  const sparkWin = el("g", { class: "sc-weldwin" }, sparks);
  for (let i = 0; i < 10; i++) el("line", { x1: 0, y1: 0, x2: 6, y2: 0, class: "sc-spark", style: `--r:${-160 + i * 20}deg; --d:${(i * 0.11).toFixed(2)}s` }, sparkWin);
  el("circle", { cx: 0, cy: 0, r: 4, class: "sc-glow" }, sparkWin);

  // rigger outside the right leg, guiding the lift
  const rig = person(c2 + 40, G, { armL: 150, armR: 10, cls: "sc-rigger" });

  // the two fitters: start at the stack, a beam end each
  const carry = el("g", { class: "sc-carry" }, crew);
  const pair = [AX - 50, AX + 50].map((x, i) => person(x, G, { armL: 172, armR: 188, cls: "sc-walker" + (i ? " sc-walker--b" : "") }, carry));

  /* strides: a swing every 0.45 s (1.5 % of 30 s) inside the two walks, still otherwise */
  const stride = (name, phase) => {
    const k = ["0% { transform: rotate(calc(var(--a) + 0deg)); }"];
    [[4, 32], [40, 68]].forEach(([a, b]) => {
      k.push(`${a}% { transform: rotate(calc(var(--a) + 0deg)); }`);
      let i = 0;
      for (let t = a + 0.75; t < b - 0.4; t += 0.75, i++) k.push(`${t.toFixed(2)}% { transform: rotate(calc(var(--a) + ${((i + phase) % 2 ? 18 : -18)}deg)); }`);
      k.push(`${b}% { transform: rotate(calc(var(--a) + 0deg)); }`);
    });
    k.push("100% { transform: rotate(calc(var(--a) + 0deg)); }");
    return `@keyframes ${name} { ${k.join(" ")} }`;
  };
  const css = document.createElement("style");
  css.textContent = stride("sc-stride-a", 0) + "\n" + stride("sc-stride-b", 1);
  document.head.append(css);

  /* ── interaction (egg.html only) ────────────────────────
     In drawing mode each worker carries an item balloon, as on an
     assembly drawing. Hover, focus or tap opens it: the trade and a link
     to apply. A tap also gets a jump out of the worker. */
  if (!document.body.classList.contains("ind--egg")) return;
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
