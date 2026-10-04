// Locks a built page behind a login: the page is encrypted (AES-GCM, key from
// PBKDF2 of "login:password") and replaced by a small form that decrypts it in
// the browser. Usage: node tools/lock.mjs index.html "login:password"
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const [file, secret] = process.argv.slice(2);
const html = readFileSync(file, "utf8");
const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, true, ["encrypt"]);
const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(html)));
const b64 = (u) => Buffer.from(u).toString("base64");

writeFileSync(file, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Bravo Integrated Solutions</title>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100svh; display: grid; place-items: center; background: #191919; color: #fff; font: 400 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; padding: 16px; }
  form { width: min(340px, 100%); display: grid; gap: 14px; }
  .mark { width: 120px; margin-bottom: 18px; }
  h1 { margin: 0 0 6px; font-size: .75rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.6); }
  label { display: grid; gap: 6px; font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.6); }
  input { min-height: 48px; padding: 10px 14px; font: inherit; font-size: 16px; color: #fff; background: transparent; border: 1px solid rgba(255,255,255,.25); border-radius: 0; }
  input:focus { outline: none; border-color: #EB4B22; }
  button { min-height: 50px; border: 0; background: #EB4B22; color: #fff; font: 600 1rem/1 inherit; font-family: inherit; cursor: pointer; }
  button:disabled { opacity: .6; cursor: wait; }
  p { min-height: 1.5em; margin: 0; font-size: .875rem; color: #EB4B22; }
  .crew { width: 100%; height: auto; margin: -6px 0 2px; overflow: visible; }
  .crew .ln, .crew .brick { fill: none; stroke: rgba(255,255,255,.55); stroke-width: 1; }
  .crew .brick { fill: #191919; stroke: rgba(255,255,255,.8); }
  .crew .gnd { stroke: rgba(255,255,255,.35); stroke-width: 1; }
  .crew .hatch { fill: none; stroke: rgba(255,255,255,.18); stroke-width: 1; }
  .crew .bub rect, .crew .bub path { fill: #191919; stroke: rgba(255,255,255,.75); stroke-width: 1; }
  .crew .bub text { fill: #fff; font: 700 8.5px system-ui, -apple-system, "Segoe UI", sans-serif; letter-spacing: .14em; text-anchor: middle; }
  .crew .man line { stroke: #EB4B22; stroke-linecap: round; }
  .crew .leg line { stroke-width: 5.5; }
  .crew .arm line { stroke-width: 4.5; }
  .crew .arm--l line { stroke: #b8391a; }
  .crew .body, .crew .face { fill: #EB4B22; }
  .crew .band { stroke: #191919; stroke-width: 1.5; opacity: .55; }
  .crew .hat { fill: #fff; stroke: #fff; stroke-width: 1.5; }
  .crew .tool { fill: #fff; stroke: #fff; stroke-width: 2; stroke-linejoin: round; }
  .crew .tick { stroke: rgba(255,255,255,.7); stroke-width: 1; stroke-linecap: round; }
</style>
</head>
<body>
<form id="f" autocomplete="on">
  <svg class="mark" viewBox="0 0 360 338.58" aria-hidden="true" fill="#fff"><path d="M180 0L360 72.23L180 144.46L0 72.23Z"/><path fill-opacity=".42" d="M0 266.35V72.23L180 144.46V338.58Z"/><path d="M360 169.29L301.5 145.59L180 194.12L58.5 145.59L0 169.29L180 241.52Z"/><path d="M360 266.35L301.5 242.65L180 291.18L58.5 242.65L0 266.35L180 338.58Z"/></svg>
  <svg class="crew" viewBox="0 0 300 140" aria-hidden="true">
    <g class="bub"><rect x="40" y="4" width="220" height="22" rx="3"/><path class="tail" d="M140 26 L146 36 L152 26"/><text x="150" y="18.5">WEBSITE UNDER CONSTRUCTION</text></g>
    <line class="gnd" x1="0" y1="128" x2="300" y2="128"/>
    <g class="site"></g>
  </svg>
  <h1>Preview — sign in</h1>
  <label>Login <input id="u" name="username" autocomplete="username" required></label>
  <label>Password <input id="p" name="password" type="password" autocomplete="current-password" required></label>
  <button id="b">Enter</button>
  <p id="m" role="status"></p>
</form>
<script>
/* the site's under construction: a worker carries bricks from the pallet and lays a wall,
   taps each one down with his trowel, and starts again when it is done */
(() => {
  const svg = document.querySelector(".crew"); if (!svg) return;
  const NS = "http://www.w3.org/2000/svg", G = 128, BW = 20, BH = 8;
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const site = svg.querySelector(".site"), tail = svg.querySelector(".tail");
  let hd = ""; for (let x = 4; x < 306; x += 9) hd += "M" + x + " " + (G + 2) + "l-7 8";
  el("path", { d: hd, class: "hatch" }, site);
  el("rect", { x: 66, y: 114, width: 40, height: 14, class: "ln" }, site); // the pallet
  el("path", { d: "M66 121h40 M86 114v14", class: "ln" }, site);
  [[66, 106], [86, 106], [76, 98]].forEach(function (b) { el("rect", { x: b[0], y: b[1], width: BW, height: BH, class: "brick" }, site); });
  [150, 170, 190, 210].forEach(function (x) { el("rect", { x: x, y: 120, width: BW, height: BH, class: "brick" }, site); }); // the course already down
  const SLOTS = [[150, 112], [170, 112], [190, 112], [210, 112], [170, 104], [190, 104]];
  const laid = SLOTS.map(function (sl) { return el("rect", { x: sl[0], y: sl[1], width: BW, height: BH, class: "brick", opacity: 0 }, site); });
  const carried = el("rect", { x: -BW / 2, y: -BH / 2, width: BW, height: BH, class: "brick", opacity: 0 }, site);
  const ticks = el("path", { d: "", class: "tick", opacity: 0 }, site);
  // the man: joints are groups turned about their own origin, as on the site
  const man = el("g", { class: "man" }, site), bob = el("g", {}, man);
  const joint = function (p, x, y, cls) { return el("g", { class: cls || "" }, el("g", { transform: "translate(" + x + " " + y + ")" }, p)); };
  const seg = function (p, len) { el("line", { x1: 0, y1: 0, x2: 0, y2: len }, p); };
  const arm = function (side) { const up = joint(bob, 0, -48, "arm arm--" + side); seg(up, 11); const fore = joint(up, 0, 11, ""); seg(fore, 11); return { up: up, fore: fore }; };
  const leg = function (hx) { const th = joint(bob, hx, -25, "leg"); seg(th, 13); const sh = joint(th, 0, 13, ""); seg(sh, 13); return { th: th, sh: sh }; };
  const aL = arm("l"), lL = leg(-2), lR = leg(2);
  el("rect", { x: -7, y: -54, width: 14, height: 31, rx: 4, class: "body" }, bob);
  el("line", { x1: -7, y1: -40, x2: 7, y2: -40, class: "band" }, bob);
  el("line", { x1: -7, y1: -33, x2: 7, y2: -33, class: "band" }, bob);
  const aR = arm("r");
  el("path", { d: "M0 10 v4 M-3.5 14 h7 l-3.5 5 z", class: "tool" }, aR.fore); // the trowel
  const head = joint(bob, 0, -54, "");
  el("circle", { cx: 0, cy: -7, r: 6, class: "face" }, head);
  el("path", { d: "M-7.5 -8 A7.5 7.5 0 0 1 7.5 -8 Z M-10 -8 H10", class: "hat" }, head);
  const rot = function (g, a) { g.setAttribute("transform", "rotate(" + a.toFixed(1) + ")"); };
  // a hand to (hx, hy) from the feet, shoulder at 0 -48, both bones 11
  const ik = function (hx, hy) {
    let dx = hx, dy = hy + 48, d = Math.hypot(dx, dy) || 1;
    if (d > 21.8) { dx *= 21.8 / d; dy *= 21.8 / d; d = 21.8; }
    const h = Math.sqrt(Math.max(0, 121 - d * d / 4)), px = -dy / d, py = dx / d;
    let ex = dx / 2 + px * h, ey = dy / 2 + py * h;
    if (dy / 2 - py * h > ey) { ex = dx / 2 - px * h; ey = dy / 2 - py * h; } // the elbow hangs low
    const ang = function (vx, vy) { return Math.atan2(-vx, vy) * 180 / Math.PI; };
    const a1 = ang(ex, ey);
    let a2 = ang(dx - ex, dy - ey) - a1; while (a2 > 180) a2 -= 360; while (a2 < -180) a2 += 360;
    return [a1, a2];
  };

  /* the day, as keyframes: x (feet), b (how low he is), r/l (hands from the feet), head */
  const K = [], ev = [];
  let t = 0, x = 110;
  const key = function (dt, k) { t += dt; K.push(Object.assign({ t: t, x: x, b: 0, r: [3, -27], l: [-3, -27], head: 0 }, k)); };
  const CARRY = { r: [10, -40], l: [7, -40] };
  const walk = function (to, k) { const d = Math.abs(to - x); x = to; key(d / 72, k || {}); };
  key(0, {});
  SLOTS.forEach(function (sl, i) {
    walk(116);
    key(0.35, { b: 10, r: [-18, -26], l: [-22, -25], head: -14 });
    key(0.3, { b: 10, r: [-18, -26], l: [-22, -25], head: -14 }); ev.push([t, "pick", i]);
    key(0.4, CARRY);
    const c = sl[0] + BW / 2, stand = c - 13, low = sl[1] === 112 ? 17 : 10;
    walk(stand, CARRY);
    const place = { b: low, r: [13, sl[1] - G + 1], l: [10, sl[1] - G + 1], head: 14 }; // hands from the feet; ik takes the crouch off
    key(0.4, place);
    key(0.2, place); ev.push([t, "lay", i]);
    const up = { b: low, r: [15, sl[1] - G - 8], l: [-3, -27 + low], head: 14 }, dn = { b: low, r: [14, sl[1] - G - 1], l: [-3, -27 + low], head: 14 };
    key(0.18, up); key(0.12, dn); ev.push([t, "tap", i]); key(0.18, up); key(0.12, dn); ev.push([t, "tap", i]);
    key(0.35, {});
  });
  walk(132); // a step back to look at it, and a thumbs up
  key(0.4, { r: [15, -62], head: -6 }); key(1.4, { r: [15, -62], head: -6 }); ev.push([t, "clear"]);
  key(0.4, {}); key(0.5, {});
  const T = t;
  const ease = function (u) { return u * u * (3 - 2 * u); };
  const at = function (tt) {
    let i = 0; while (i < K.length - 2 && K[i + 1].t < tt) i++;
    const a = K[i], b = K[i + 1], u = b.t > a.t ? Math.max(0, Math.min(1, (tt - a.t) / (b.t - a.t))) : 1, e = ease(u);
    const mix = function (p, q) { return p + (q - p) * e; };
    return { x: a.x + (b.x - a.x) * u, b: mix(a.b, b.b), r: [mix(a.r[0], b.r[0]), mix(a.r[1], b.r[1])], l: [mix(a.l[0], b.l[0]), mix(a.l[1], b.l[1])], head: mix(a.head, b.head), v: (b.x - a.x) / Math.max(0.001, b.t - a.t) };
  };
  let phase = 0, lastX = 110, lastT = 0, carrying = -1, face = 1;
  const draw = function (tt) {
    const s = at(tt);
    // what has happened by now: bricks laid, the one in his hands
    let n = 0; carrying = -1; let tapAt = -9;
    ev.forEach(function (e) { if (e[0] > tt) return; if (e[1] === "pick") carrying = e[2]; if (e[1] === "lay") { carrying = -1; n = e[2] + 1; } if (e[1] === "tap") tapAt = e[0]; if (e[1] === "clear") n = -1; });
    const clearT = ev[ev.length - 1][0];
    laid.forEach(function (r, i) { r.setAttribute("opacity", n === -1 ? Math.max(0, 1 - (tt - clearT) / 0.5) : i < n ? 1 : 0); });
    if (Math.abs(s.v) > 1) face = s.v > 0 ? 1 : -1; else if (s.r[0] !== 3) face = s.r[0] > 0 ? 1 : -1;
    phase += Math.abs(s.x - lastX) / 6.5; lastX = s.x;
    const moving = Math.abs(s.v) > 1, sn = Math.sin(phase);
    let thL, thR, shL, shR;
    if (moving) {
      thL = -22 * sn * face; thR = 22 * sn * face;
      shL = 30 * Math.max(0, -sn) * face; shR = 30 * Math.max(0, sn) * face;
    } else {
      const q = Math.acos(Math.max(0.2, Math.min(1, (25 - s.b) / 26))) * 180 / Math.PI;
      thL = -q * face; thR = -q * 0.85 * face; shL = 2 * q * face; shR = 1.7 * q * face;
    }
    const lift = moving ? -1.6 * Math.abs(Math.cos(phase)) : 0;
    man.setAttribute("transform", "translate(" + s.x.toFixed(1) + " " + G + ")");
    bob.setAttribute("transform", "translate(0 " + (s.b + lift).toFixed(1) + ")");
    rot(lL.th, thL); rot(lL.sh, shL); rot(lR.th, thR); rot(lR.sh, shR);
    let r = s.r, l = s.l;
    if (moving && carrying < 0) { r = [3 + 6 * sn, -27]; l = [-3 - 6 * sn, -27]; }
    const ar = ik(r[0], r[1] - s.b), al = ik(l[0], l[1] - s.b);
    rot(aR.up, ar[0]); rot(aR.fore, ar[1]); rot(aL.up, al[0]); rot(aL.fore, al[1]);
    rot(head, s.head);
    if (carrying >= 0) {
      carried.setAttribute("opacity", 1);
      carried.setAttribute("transform", "translate(" + (s.x + (r[0] + l[0]) / 2).toFixed(1) + " " + (G + (r[1] + l[1]) / 2 + 3).toFixed(1) + ")");
    } else carried.setAttribute("opacity", 0);
    const since = tt - tapAt, sl = SLOTS[Math.max(0, n - 1)];
    if (since >= 0 && since < 0.22 && n > 0) {
      const cx = sl[0] + BW / 2 + 4, cy = sl[1] - 2;
      ticks.setAttribute("d", "M" + (cx - 6) + " " + (cy - 3) + "l-3 -3 M" + cx + " " + (cy - 5) + "v-4 M" + (cx + 6) + " " + (cy - 3) + "l3 -3");
      ticks.setAttribute("opacity", 1);
    } else ticks.setAttribute("opacity", 0);
    // the balloon's tail points at his head, wherever he is
    const hx = Math.max(52, Math.min(248, s.x));
    tail.setAttribute("d", "M" + (hx - 6) + " 26 L" + (hx + (s.x - hx) * 0.3).toFixed(1) + " 36 L" + (hx + 6) + " 26");
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { draw(K[8].t); return; }
  const t0 = performance.now();
  const frame = function (now) { if (!document.body.contains(svg)) return; draw(((now - t0) / 1000) % T); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
})();
(() => {
  const S = "${b64(salt)}", I = "${b64(iv)}", D = "${b64(data)}";
  const un = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const open = async (secret) => {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: un(S), iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const html = new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: un(I) }, key, un(D)));
    try { sessionStorage.setItem("bravo-gate", secret); } catch (e) {}
    document.open(); document.write(html); document.close();
  };
  let saved = null; try { saved = sessionStorage.getItem("bravo-gate"); } catch (e) {}
  if (saved) open(saved).catch(() => { try { sessionStorage.removeItem("bravo-gate"); } catch (e) {} });
  document.getElementById("f").addEventListener("submit", async (e) => {
    e.preventDefault();
    const b = document.getElementById("b"), m = document.getElementById("m");
    b.disabled = true; m.textContent = "";
    try { await open(document.getElementById("u").value.trim() + ":" + document.getElementById("p").value); }
    catch (err) { m.textContent = "Wrong login or password."; b.disabled = false; }
  });
})();
</script>
</body>
</html>
`);
console.log("locked", file, `(${html.length} bytes)`);
