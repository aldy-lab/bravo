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
</style>
</head>
<body>
<form id="f" autocomplete="on">
  <svg class="mark" viewBox="0 0 360 338.58" aria-hidden="true" fill="#fff"><path d="M180 0L360 72.23L180 144.46L0 72.23Z"/><path fill-opacity=".42" d="M0 266.35V72.23L180 144.46V338.58Z"/><path d="M360 169.29L301.5 145.59L180 194.12L58.5 145.59L0 169.29L180 241.52Z"/><path d="M360 266.35L301.5 242.65L180 291.18L58.5 242.65L0 266.35L180 338.58Z"/></svg>
  <h1>Preview — sign in</h1>
  <label>Login <input id="u" name="username" autocomplete="username" required></label>
  <label>Password <input id="p" name="password" type="password" autocomplete="current-password" required></label>
  <button id="b">Enter</button>
  <p id="m" role="status"></p>
</form>
<script>
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
