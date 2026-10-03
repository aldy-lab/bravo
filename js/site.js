/* ─────────────────────────────────────────────────────────────
   GO-LIVE VALUES — fill these in when the client sends them.
   A blank value removes its element from the page (and an empty
   block with it), so nothing can ship as a dead href="#".

   Forms: with `formEndpoint` set (e.g. a Formspree form URL) the
   forms post there, CV files included. Without it but with an
   email, they open the visitor's mail app with the answers filled
   in. With neither, the forms are removed — except in ?preview,
   where they run but send nothing.
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  email: "",          // e.g. "info@bravo.eu" — contact details + inquiry form fallback
  careersEmail: "",   // e.g. "jobs@bravo.eu" — application form fallback; falls back to email
  phone: "",          // e.g. "+370 600 00000"
  address: "",        // street, city, country
  linkedin: "",       // full URL of the company page
  formEndpoint: "",   // e.g. "https://formspree.io/f/xxxxxxxx"
};

(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const preview = "preview" in root.dataset;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ── config: switch links on, or remove them ─────────────── */
  const mailto = (addr, subject) => "mailto:" + addr + (subject ? "?subject=" + encodeURIComponent(subject) : "");
  $$("[data-config]").forEach((el) => {
    const key = el.dataset.config;
    const val = (CONFIG[key] || "").trim();
    if (!val) { el.remove(); return; }
    if (key === "email") {
      el.href = mailto(val, el.dataset.subject);
      if (!el.textContent.trim()) el.textContent = val;
    } else if (key === "phone") {
      el.href = "tel:" + val.replace(/[^\d+]/g, "");
      el.textContent = val;
    } else if (key === "linkedin") {
      el.href = val;
    } else {
      el.textContent = val;
    }
  });
  // innermost groups first, so an emptied row also empties its list
  $$("[data-config-group]").reverse().forEach((g) => { if (!$("[data-config]", g)) g.remove(); });

  $$("[data-year]").forEach((y) => { y.textContent = new Date().getFullYear(); });

  /* ── drawing mode (the "B" button) ───────────────────────── */
  const setMode = (drawing) => {
    root.classList.remove("is-switching", "is-switching-back");
    void root.offsetWidth; // restart the scan animation
    root.classList.add(drawing ? "is-switching" : "is-switching-back");
    clearTimeout(setMode.t);
    setMode.t = setTimeout(() => root.classList.remove("is-switching", "is-switching-back"), 1300);
    if (drawing) root.dataset.mode = "drawing"; else delete root.dataset.mode;
    $$(".egg").forEach((b) => b.setAttribute("aria-pressed", String(drawing)));
    try { localStorage.setItem("bravo-mode", drawing ? "drawing" : "photo"); } catch (e) { /* private mode */ }
  };
  $$(".egg").forEach((b) => {
    b.setAttribute("aria-pressed", String(root.dataset.mode === "drawing"));
    b.addEventListener("click", () => setMode(root.dataset.mode !== "drawing"));
  });

  /* ── header: mobile menu ─────────────────────────────────── */
  const top = $("[data-top]");
  const menu = $(".menu");
  const setMenu = (open) => { top.classList.toggle("is-open", open); menu.setAttribute("aria-expanded", String(open)); };
  menu.addEventListener("click", () => setMenu(!top.classList.contains("is-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  $$("#tabs a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ── content: vacancies and projects ─────────────────────── */
  const data = window.BRAVO_CONTENT || { vacancies: [], projects: [] };
  const visible = (list) => list.filter((x) => preview || !x.sample);
  const stamp = (x) => (x.sample ? '<span class="stamp">Sample</span>' : "");

  const jobsEl = $("[data-jobs]");
  if (jobsEl) {
    const jobs = visible(data.vacancies);
    const select = $("[data-positions]");
    jobs.forEach((j, i) => {
      jobsEl.insertAdjacentHTML("beforeend", `
        <li class="job"><details>
          <summary>
            <span class="job__n">${String(i + 1).padStart(2, "0")}</span>
            <span class="job__title">${esc(j.title)} ${stamp(j)}</span>
            <span class="job__meta">${esc(j.type)} · ${esc(j.location)}</span>
            <span class="job__plus" aria-hidden="true"></span>
          </summary>
          <div class="job__body">
            <dl class="job__facts">
              <div><dt>Start</dt><dd>${esc(j.start)}</dd></div>
              <div><dt>Duration</dt><dd>${esc(j.duration)}</dd></div>
              <div><dt>Location</dt><dd>${esc(j.location)}</dd></div>
            </dl>
            <div><p class="job__req-h">Requirements</p><ul class="job__req">${j.requirements.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
            <p><a class="btn btn--line" href="#apply" data-apply="${esc(j.title)}">Apply for this position <span aria-hidden="true">→</span></a></p>
          </div>
        </details></li>`);
      if (select) select.insertAdjacentHTML("beforeend", `<option>${esc(j.title)}</option>`);
    });
    const count = $("[data-jobs-count]");
    if (count) count.textContent = jobs.length ? `${jobs.length} open` : "";
    if (!jobs.length) $("[data-jobs-empty]").hidden = false;
    jobsEl.addEventListener("click", (e) => {
      const a = e.target.closest("[data-apply]");
      if (a && select) select.value = a.dataset.apply;
    });
  }

  const projEl = $("[data-projects]");
  if (projEl) {
    const projects = visible(data.projects);
    if (!projects.length) $("[data-projects-wrap]").remove();
    projects.forEach((p, i) => {
      projEl.insertAdjacentHTML("beforeend", `
        <li class="project">
          <figure class="ph ph--frame">
            <img class="ph__img" src="assets/img/${p.photo}-960.webp" alt="" loading="lazy" width="960" height="640">
            <img class="ph__bp" src="assets/img/${p.photo}-bp.webp" alt="" loading="lazy">
            <figcaption><span class="cap-photo">Ref.</span><span class="cap-dwg">Dwg.</span> ${String(i + 1).padStart(2, "0")} — ${esc(p.sector)}</figcaption>
          </figure>
          <h3>${esc(p.title)} ${stamp(p)}</h3>
          <p>${esc(p.scope)}</p>
          <dl class="project__facts">
            <div><dt>Location</dt><dd>${esc(p.location)}</dd></div>
            <div><dt>Year</dt><dd>${esc(p.year)}</dd></div>
            <div><dt>Team</dt><dd>${esc(p.team)}</dd></div>
          </dl>
        </li>`);
    });
    const count = $("[data-projects-count]");
    if (count) count.textContent = projects.length ? `${projects.length} projects` : "";
  }

  /* ── forms ───────────────────────────────────────────────── */
  const topic = new URLSearchParams(location.search).get("topic");
  if (topic && $("#c-topic")) $("#c-topic").value = topic;

  $$("[data-form]").forEach((form) => {
    const kind = form.dataset.form;
    const to = ((kind === "application" && CONFIG.careersEmail) || CONFIG.email || "").trim();
    const mode = CONFIG.formEndpoint ? "post" : to ? "mail" : preview ? "demo" : "off";
    if (mode === "off") {
      // nowhere to send it: remove the form and anything that points at it
      const sec = form.closest("section");
      if (sec && sec.id === "apply") { sec.remove(); $$('a[href="#apply"]').forEach((a) => a.closest("p")?.remove()); }
      else form.remove();
      return;
    }
    if (mode !== "post") $$("[data-needs-endpoint]", form).forEach((f) => f.remove());
    const status = $("[data-status]", form);
    const say = (msg, bad) => { status.textContent = msg; status.classList.toggle("is-bad", !!bad); };

    const mark = (input) => {
      const ok = input.checkValidity();
      input.toggleAttribute("aria-invalid", !ok);
      input.closest(".field")?.classList.toggle("field--error", !ok);
      return ok;
    };
    form.addEventListener("input", (e) => { if (e.target.hasAttribute("aria-invalid")) mark(e.target); });
    form.addEventListener("change", (e) => { if (e.target.hasAttribute("aria-invalid")) mark(e.target); });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if ($('[name="_gotcha"]', form).value) return;
      const file = $('input[type="file"]', form);
      if (file) file.setCustomValidity(file.files[0] && file.files[0].size > 10 * 1024 * 1024 ? "File is larger than 10 MB" : "");
      const inputs = $$("input, select, textarea", form).filter((i) => i.type !== "hidden" && i.name !== "_gotcha");
      const bad = inputs.filter((i) => !mark(i));
      if (bad.length) { say("Please check the highlighted fields.", true); bad[0].focus(); return; }

      const fd = new FormData(form);
      if (mode === "demo") {
        say("Preview: the form works, but nothing was sent.");
        form.reset();
        return;
      }
      if (mode === "mail") {
        const lines = [];
        fd.forEach((v, k) => { if (k !== "_gotcha" && k !== "form" && v) lines.push(`${k.replace(/_/g, " ")}: ${v}`); });
        const subject = kind === "application" ? `Application — ${fd.get("position")} — ${fd.get("name")}` : `Inquiry — ${fd.get("company")}`;
        location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
        say(kind === "application" ? "Your email app should open with the application filled in. Attach your CV there and send it." : "Your email app should open with the message filled in.");
        return;
      }
      const btn = $('button[type="submit"]', form);
      btn.disabled = true; say("Sending…");
      try {
        const res = await fetch(CONFIG.formEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        say(kind === "application" ? "Thank you — your application was sent. We will contact you." : "Thank you — we will reply soon.");
      } catch (err) {
        say("Sending failed. Please try again" + (to ? ` or write to ${to}.` : "."), true);
      } finally { btn.disabled = false; }
    });
  });

  // with no form to point at, the empty-vacancies note must not promise one
  const empty = $("[data-jobs-empty]");
  if (empty && !$("#apply")) empty.textContent = "No positions are listed right now. Please check back soon.";

  /* ── the manoeuvring board (home only) ───────────────────── */
  const board = $("[data-board]");
  if (!board) return;

  const rx = $(".ruler--x"), ry = $(".ruler--y");
  if (rx) for (let v = -30; v <= 30; v += 10) rx.insertAdjacentHTML("beforeend", `<span>${v}</span>`);
  if (ry) for (let v = 20; v >= -20; v -= 10) ry.insertAdjacentHTML("beforeend", `<span>${v}</span>`);

  const SECTIONS = [
    { brg: 0,   href: "services.html", title: "Services", sub: "Teams · Engineering · Digital", text: "Field teams, engineering and supervision for industrial projects." },
    { brg: 90,  href: "projects.html", title: "Projects", sub: "References · BravoDoc", text: "Projects we staff and the tools we build for them." },
    { brg: 180, href: "careers.html",  title: "Careers",  sub: "Vacancies · Apply", text: "Open positions for trades and engineers — apply online." },
    { brg: 270, href: "contact.html",  title: "Contact",  sub: "Inquiry form", text: "Tell us about your project and the team you need." },
  ];
  const STEP = 90;
  const NS = "http://www.w3.org/2000/svg";
  const card = $("[data-card]", board);
  const vectors = $("[data-vectors]", board);
  const list = $("[data-nodes]", board);
  const hint = $("[data-hint]");
  const coords = $("[data-coords]");
  const hero = $(".hero");
  const C = 500, R_NODE = 290;

  // compass card: a tick every degree, numbers every 30
  const el = (name, attrs) => { const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  for (let d = 0; d < 360; d += 30) card.append(el("line", { class: "spoke", x1: C, y1: C - 96, x2: C, y2: C - 384, transform: `rotate(${d} ${C} ${C})` }));
  for (let d = 0; d < 360; d++) {
    const len = d % 10 === 0 ? 22 : d % 5 === 0 ? 14 : 7;
    const cls = d % 10 === 0 ? "tick tick--10" : d % 5 === 0 ? "tick tick--5" : "tick";
    card.append(el("line", { class: cls, x1: C, y1: C - 430, x2: C, y2: C - 430 - len, transform: `rotate(${d} ${C} ${C})` }));
  }
  for (let d = 0; d < 360; d += 30) {
    const t = el("text", { x: C, y: C - 404, transform: `rotate(${d} ${C} ${C})` });
    t.textContent = String(d).padStart(3, "0");
    card.append(t);
  }

  const nodes = SECTIONS.map((s, i) => {
    const li = document.createElement("li");
    li.className = "node";
    li.innerHTML = `<a href="${s.href}" data-i="${i}"><span class="node__dot"></span><span class="node__label">${s.title}</span><span class="node__sub">${s.sub}</span></a>`;
    list.append(li);
    const v = el("line", {});
    vectors.append(v);
    return { ...s, li, a: li.firstElementChild, v };
  });

  // state: heading under the lubber line, in unbounded degrees
  let heading = 0, target = 0, active = -1, raf = 0, last = 0, onArrive = null;
  const norm = (d) => ((d % 360) + 360) % 360;
  const shortest = (from, to) => from + (((to - from) % 360) + 540) % 360 - 180;
  const nearest = (h) => Math.round(h / STEP) * STEP;
  const readout = { brg: $('[data-r="brg"]'), title: $('[data-r="title"]'), text: $('[data-r="text"]'), href: $('[data-r="href"]') };

  function layout() {
    const k = board.clientWidth / 1000;
    card.setAttribute("transform", `rotate(${-heading} ${C} ${C})`);
    nodes.forEach((n) => {
      const phi = (n.brg - heading) * Math.PI / 180;
      const sx = Math.sin(phi), sy = -Math.cos(phi);
      n.li.style.transform = `translate(${(C + R_NODE * sx) * k}px, ${(C + R_NODE * sy) * k}px)`;
      n.v.setAttribute("x1", C + 80 * sx); n.v.setAttribute("y1", C + 80 * sy);
      n.v.setAttribute("x2", C + (R_NODE - 22) * sx); n.v.setAttribute("y2", C + (R_NODE - 22) * sy);
    });
    const idx = nodes.findIndex((n) => n.brg === norm(nearest(heading)));
    if (idx !== active) {
      active = idx;
      nodes.forEach((n, i) => { n.li.classList.toggle("is-active", i === idx); n.v.classList.toggle("is-active", i === idx); });
      const n = nodes[idx];
      readout.brg.textContent = String(n.brg).padStart(3, "0");
      readout.title.textContent = n.title;
      readout.text.textContent = n.text;
      readout.href.href = n.href;
    }
  }

  // critically damped approach to the target heading
  function tick(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!dragging) {
      heading += (target - heading) * (1 - Math.exp(-dt * 11));
      if (Math.abs(target - heading) < 0.05) heading = target;
    }
    layout();
    if (dragging || heading !== target) raf = requestAnimationFrame(tick);
    else { raf = 0; last = 0; if (onArrive) { const f = onArrive; onArrive = null; f(); } }
  }
  const run = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const steer = (to, then) => {
    target = shortest(heading, to);
    onArrive = then || null;
    if (reduced) { heading = target; layout(); if (onArrive) { const f = onArrive; onArrive = null; f(); } return; }
    run();
  };
  const dismissHint = () => hint && hint.classList.add("is-gone");

  // dragging: the card follows the finger round the centre, with a flick
  let dragging = false, moved = false, startAngle = 0, startHeading = 0, samples = [];
  const angleAt = (e) => {
    const r = board.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    return { a: Math.atan2(x, -y) * 180 / Math.PI, d: Math.hypot(x, y) / (r.width / 1000) };
  };
  board.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const p = angleAt(e);
    moved = false;
    if (p.d < 60) return; // the hub is too close to the centre to steer by
    dragging = true;
    startAngle = p.a; startHeading = heading; samples = [{ t: e.timeStamp, h: heading }];
    onArrive = null;
  });
  addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = angleAt(e);
    const delta = ((p.a - startAngle + 540) % 360) - 180;
    if (!moved && Math.abs(delta) > 2) {
      moved = true;
      board.classList.add("is-dragging");
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* already released */ }
      dismissHint();
      run();
    }
    if (!moved) return;
    heading = startHeading - delta;
    if (Math.abs(delta) > 90) { startAngle = p.a; startHeading = heading; } // re-anchor before the angle wraps
    samples.push({ t: e.timeStamp, h: heading });
    if (samples.length > 6) samples.shift();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    board.classList.remove("is-dragging");
    if (!moved) return;
    const a = samples[0], b = samples[samples.length - 1];
    const v = b.t > a.t ? (b.h - a.h) / ((b.t - a.t) / 1000) : 0; // deg/s
    target = nearest(heading + Math.max(-240, Math.min(240, v * 0.22)));
    run();
  };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  // a click that was really a drag must not navigate; otherwise steer, then go
  list.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-i]");
    if (!a) return;
    e.preventDefault();
    if (moved) { moved = false; return; }
    const n = nodes[+a.dataset.i];
    dismissHint();
    steer(n.brg, () => setTimeout(() => { location.href = n.href; }, reduced ? 0 : 160));
  });
  list.addEventListener("focusin", (e) => {
    const a = e.target.closest("a[data-i]");
    if (a && !dragging) steer(nodes[+a.dataset.i].brg);
  });
  board.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k !== "ArrowRight" && k !== "ArrowLeft" && k !== "ArrowUp" && k !== "ArrowDown") return;
    e.preventDefault();
    dismissHint();
    const to = norm(nearest(target) + (k === "ArrowRight" || k === "ArrowDown" ? STEP : -STEP));
    steer(to);
    nodes.find((x) => x.brg === to).a.focus({ preventScroll: true });
  });

  // bearing and range under the pointer, as on a real plotting sheet
  const idle = "BRG ---° · RNG -.-";
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" && !dragging) return;
    const p = angleAt(e);
    if (p.d > 470) { coords.textContent = idle; return; }
    coords.textContent = `BRG ${String(norm(Math.round(p.a + heading))).padStart(3, "0")}° · RNG ${(p.d / 96).toFixed(1)}`;
  });
  hero.addEventListener("pointerleave", () => { coords.textContent = idle; });

  new ResizeObserver(layout).observe(board);
  layout();
})();
