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

  const select = $("[data-positions]");
  const jobsEl = $("[data-jobs]");
  if (jobsEl) {
    const jobs = visible(data.vacancies);
    jobs.forEach((j, i) => {
      jobsEl.insertAdjacentHTML("beforeend", `
        <li><button type="button" data-apply="${esc(j.title)}">
          <span class="in-jobs__n">${String(i + 1).padStart(2, "0")}</span>
          <span class="in-jobs__t">${esc(j.title)} ${stamp(j)}</span>
          <span class="in-jobs__m">${esc(j.type)} · ${esc(j.duration)}</span>
        </button></li>`);
      if (select) select.insertAdjacentHTML("beforeend", `<option>${esc(j.title)}</option>`);
    });
    if (!jobs.length) $("[data-jobs-empty]").hidden = false;
  }

  const projEl = $("[data-projects]");
  if (projEl) {
    const projects = visible(data.projects);
    if (!projects.length) projEl.remove();
    projects.forEach((p) => {
      projEl.insertAdjacentHTML("beforeend", `<li><b>${esc(p.title)} ${stamp(p)}</b><span>${esc(p.sector)} · ${esc(p.year)} · ${esc(p.team)}</span></li>`);
    });
  }

  /* ── dialogs: the forms open over the page ───────────────── */
  const openDialog = (id) => {
    const d = document.getElementById(id);
    if (!d || !d.showModal) return false;
    d.showModal();
    return true;
  };
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) { openDialog(open.dataset.open); return; }
    const job = e.target.closest("[data-apply]");
    if (job) { if (select) select.value = job.dataset.apply; openDialog("apply"); return; }
    const close = e.target.closest("[data-close]");
    if (close) { close.closest("dialog").close(); return; }
    if (e.target.tagName === "DIALOG") e.target.close(); // a click on the backdrop
    const t = e.target.closest("[data-topic]");
    if (t && $("#c-topic")) $("#c-topic").value = t.dataset.topic;
  });

  /* ── forms ───────────────────────────────────────────────── */
  const qs = new URLSearchParams(location.search);
  if (qs.get("topic") && $("#c-topic")) $("#c-topic").value = qs.get("topic");
  if (qs.get("trade") && $("#a-trade")) $("#a-trade").value = qs.get("trade");

  $$("[data-form]").forEach((form) => {
    const kind = form.dataset.form;
    const to = ((kind === "application" && CONFIG.careersEmail) || CONFIG.email || "").trim();
    const mode = CONFIG.formEndpoint ? "post" : to ? "mail" : preview ? "demo" : "off";
    if (mode === "off") {
      // nowhere to send it: remove the form, its dialog and anything that opens it
      const d = form.closest("dialog");
      if (d) { $$(`[data-open="${d.id}"]`).forEach((b) => (b.closest("[data-open-wrap]") || b).remove()); d.remove(); }
      else form.remove();
      $$("[data-apply]").forEach((b) => { if (kind === "application") b.removeAttribute("data-apply"); });
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


  // the contact section must not end up empty while the client's details are pending
  if ($("[data-contact-empty]") && !$(".in-contact") && !$('[data-open="inquiry"]')) $("[data-contact-empty]").hidden = false;
})();
