/* The assembly scene behind variant E: a line drawing of a yard at work.
   A gantry crane lowers a section onto a hull block while a welder works
   the seam from the scaffold and a rigger guides the load; a fitter
   torques bolts on a column; two fitters carry a beam along the yard,
   passing under the board. Structure in thin ink, people as solid orange
   silhouettes. All motion is CSS (transform/opacity) and stops under
   reduced motion. */
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
  const crew = el("g", { class: "sc-crew" }, svg);
  const G = 400; // ground line

  /* ── structure ─────────────────────────────────────────── */
  el("line", { x1: 0, y1: G, x2: 1600, y2: G, class: "sc-ground" }, ink);
  for (let x = 0; x < 1600; x += 14) el("line", { x1: x, y1: G + 2, x2: x - 10, y2: G + 12, class: "sc-hatch" }, ink);

  // hull block on stands: front face, top, side, ribs and stringers
  const bx = 214, bw = 276, by = 322, bh = 58, dx = 40, dy = -30;
  el("path", { d: `M${bx} ${by}h${bw}v${bh}h${-bw}Z M${bx} ${by}l${dx} ${dy}h${bw}l${-dx} ${-dy} M${bx + bw} ${by}l${dx} ${dy}v${bh}l${-dx} ${-dy}` }, ink);
  for (let x = bx + 30; x < bx + bw; x += 30) {
    el("line", { x1: x, y1: by, x2: x, y2: by + bh, class: "sc-rib" }, ink);
    el("line", { x1: x, y1: by, x2: x + dx, y2: by + dy, class: "sc-rib" }, ink);
  }
  el("line", { x1: bx, y1: by + 30, x2: bx + bw, y2: by + 30, class: "sc-rib" }, ink);
  [bx + 16, bx + bw / 2 - 20, bx + bw - 56].forEach((x) => el("path", { d: `M${x} ${by + bh}l10 ${G - by - bh} M${x + 40} ${by + bh}l-10 ${G - by - bh} M${x + 2} ${G - 8}h36` }, ink));

  // gantry crane straddling the block
  const c1 = 150, c2 = 660, top = 196;
  el("path", { d: `M${c1} ${G}L${c1 + 12} ${top} M${c1 + 30} ${G}L${c1 + 18} ${top} M${c2} ${G}L${c2 - 12} ${top} M${c2 - 30} ${G}L${c2 - 18} ${top} M${c1 + 2} ${G - 90}h28 M${c2 - 30} ${G - 90}h28` }, ink);
  el("path", { d: `M${c1 - 8} ${top}H${c2 + 8} M${c1 - 8} ${top + 14}H${c2 + 8} M${c1 - 8} ${top}v14 M${c2 + 8} ${top}v14` }, ink);
  for (let x = c1; x < c2; x += 24) el("line", { x1: x, y1: top, x2: x + 12, y2: top + 14, class: "sc-rib" }, ink);
  const tx = 372;
  el("rect", { x: tx - 20, y: top + 14, width: 40, height: 12 }, ink);
  const hoist = el("g", { class: "sc-hoist" }, ink);
  const cableTop = top + 26, cableLen = 14;
  el("line", { x1: tx, y1: cableTop, x2: tx, y2: cableTop + cableLen, class: "sc-cable", style: `transform-origin: ${tx}px ${cableTop}px` }, hoist);
  const load = el("g", { class: "sc-load" }, hoist);
  const ly = cableTop + cableLen;
  el("path", { d: `M${tx} ${ly}l-5 6h10Z M${tx - 5} ${ly + 6}L${tx - 58} ${ly + 16} M${tx + 5} ${ly + 6}L${tx + 58} ${ly + 16}` }, load);
  el("path", { d: `M${tx - 74} ${ly + 16}h148 M${tx - 74} ${ly + 30}h148 M${tx - 74} ${ly + 16}v14 M${tx + 74} ${ly + 16}v14 M${tx - 30} ${ly + 16}v14 M${tx + 30} ${ly + 16}v14` }, load);

  // scaffold beside the block, with a working platform
  const sx = bx + bw + 14, PL = 348;
  [sx, sx + 64].forEach((x) => el("line", { x1: x, y1: G, x2: x, y2: 282 }, ink));
  [PL, 376, 304].forEach((y) => el("line", { x1: sx - 4, y1: y, x2: sx + 68, y2: y }, ink));
  el("path", { d: `M${sx} ${G}L${sx + 64} ${PL} M${sx} ${PL}L${sx + 64} 282`, class: "sc-rib" }, ink);
  el("rect", { x: sx - 4, y: PL, width: 72, height: 4 }, ink);

  // a steel column with a bolted splice
  const kx = 800;
  el("path", { d: `M${kx} ${G}V196 M${kx + 22} ${G}V196 M${kx - 7} 196h36 M${kx - 7} ${G}h36 M${kx - 4} 300h30 M${kx - 4} 320h30` }, ink);
  for (let y = 206; y < G; y += 20) el("line", { x1: kx + 3, y1: y, x2: kx + 19, y2: y + 16, class: "sc-rib" }, ink);

  // beams stacked at the far end of the walk
  for (let i = 0; i < 4; i++) el("path", { d: `M1300 ${G - 8 - i * 10}h120 M1300 ${G - 2 - i * 10}h120` }, ink);

  /* ── people ─────────────────────────────────────────────
     Solid silhouettes. Each limb hangs from its joint at (0,0) and points
     down, so a CSS rotate() turns it about that joint. */
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
  for (let i = 0; i < 10; i++) {
    el("line", { x1: 0, y1: 0, x2: 6, y2: 0, class: "sc-spark", style: `--r:${-160 + i * 20}deg; --d:${(i * 0.11).toFixed(2)}s` }, sparks);
  }
  el("circle", { cx: 0, cy: 0, r: 4, class: "sc-glow" }, sparks);

  // rigger at the crane leg, guiding the section down
  const rig = person(c2 - 70, G, { armL: 150, armR: 10, cls: "sc-rigger" });

  // fitter torquing the splice bolts on the column
  const f = person(kx - 20, G, { armL: 14, armR: -96, cls: "sc-bolter" });
  el("path", { d: "M0 21 l7 7 M0 21 l-4 6", class: "sc-tool" }, f.aR);

  // two fitters carrying a beam along the yard, under the board
  const carry = el("g", { class: "sc-carry" }, crew);
  const beamY = G - 75; // held overhead, just above the helmets
  el("path", { d: `M888 ${beamY}h150 M888 ${beamY - 6}h150 M888 ${beamY + 3}h150`, class: "sc-beam" }, carry);
  const pair = [900, 1024].map((x, i) => person(x, G, { armL: 172, armR: 188, cls: "sc-walker" + (i ? " sc-walker--b" : "") }, carry));

  /* ── interaction (egg.html only) ────────────────────────
     In drawing mode each worker carries an item balloon, as on an
     assembly drawing. Hover, focus or tap opens it: the trade and a link
     to apply. A tap also gets a reaction out of the worker. */
  if (!document.body.classList.contains("ind--egg")) return;
  host.removeAttribute("aria-hidden");
  ink.setAttribute("aria-hidden", "true");
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", "The crew at work");

  const CREW = [
    { man: w, trade: "Welder", react: "sc-burst", lead: [-34, -40] },
    { man: rig, trade: "Rigger", react: "sc-hurry", lead: [40, -40] },
    { man: f, trade: "Fitter", react: "sc-hurry", lead: [54, -56] },
    { man: pair[1], trade: "Fitter", react: "sc-halt", lead: [34, -30], label: "Fitters" },
  ];
  const calls = CREW.map((c, i) => {
    const call = el("g", { class: "sc-call" }, c.man.g);
    const [lx, ly] = c.lead, hx = 0, hy = -70, bx2 = hx + lx, by2 = hy + ly;
    const right = lx > 0;
    el("path", { d: `M${hx + (right ? 4 : -4)} ${hy}L${bx2} ${by2}`, class: "sc-call__lead" }, call);
    el("circle", { cx: bx2, cy: by2, r: 11, class: "sc-call__ball" }, call);
    el("text", { x: bx2, y: by2 + 4, class: "sc-call__no" }, call).textContent = i + 1;
    const tag = el("g", { class: "sc-call__tag" }, call);
    const tx0 = right ? bx2 + 18 : bx2 - 18, anchor = right ? "start" : "end";
    el("line", { x1: bx2 + (right ? 11 : -11), y1: by2, x2: tx0 + (right ? 104 : -104), y2: by2, class: "sc-call__rule" }, tag);
    el("text", { x: tx0, y: by2 - 6, "text-anchor": anchor, class: "sc-call__t" }, tag).textContent = (c.label || c.trade).toUpperCase();
    const link = el("a", { href: `careers.html?trade=${encodeURIComponent(c.trade)}#apply`, class: "sc-call__a" }, tag);
    el("text", { x: tx0, y: by2 + 16, "text-anchor": anchor }, link).textContent = `Join as ${c.trade.toLowerCase()} →`;
    // a generous invisible target over the worker himself
    el("rect", { x: -16, y: -74, width: 32, height: 76, class: "sc-hit" }, c.man.g);
    c.man.g.classList.add("sc-man--live");
    return { ...c, call };
  });

  const close = () => calls.forEach((c) => { c.man.g.classList.remove("is-open", c.react); });
  calls.forEach((c) => {
    c.man.g.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // the link navigates as usual
      const open = c.man.g.classList.contains("is-open");
      close();
      if (open) return;
      c.man.g.classList.add("is-open", c.react);
      if (c.man.g.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        c.man.g.animate([{ translate: "0 0" }, { translate: "0 -10px" }, { translate: "0 0" }], { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      }
    });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".sc-man--live")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // the crane: a tap sends the section down or brings it back up
  const crane = el("rect", { x: c1 - 10, y: top - 8, width: c2 - c1 + 20, height: 36, class: "sc-hit sc-hit--crane" });
  svg.insertBefore(crane, crew); // under the crew, so a balloon over the gantry stays clickable
  crane.addEventListener("click", () => svg.classList.toggle("is-lowered"));
})();
