import { STUDIO_COOKIE, STUDIO_KIT_COOKIE, bytesToB64Url, verifyStudioToken } from "./_studio-token.js";

const text = new TextEncoder();

function gateHtml() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>ShoRebel Studio</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #101114; color: #f4f4f5; font-family: "Lexend Deca", "Segoe UI", system-ui, sans-serif; }
    main { width: min(420px, calc(100% - 48px)); text-align: center; }
    p { margin: 0; }
    .mark { font-weight: 700; letter-spacing: -0.03em; font-size: 28px; }
    .tool { margin-top: 4px; color: #a1a1aa; font-size: 14px; font-weight: 600; }
    .reason { margin-top: 18px; color: #d4d4d8; line-height: 1.5; }
    a { display: inline-flex; margin-top: 22px; padding: 10px 18px; border-radius: 999px; background: #00d4ff; color: #06222e; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <p class="mark">ShoRebel</p>
    <p class="tool">Studio</p>
    <p class="reason">Studio is included on Station. Open it from the ShoRebel menu after you are on Station.</p>
    <a href="https://shorebel.com/upgrade?for=studio">View Station</a>
  </main>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

function kitCookie(payload) {
  const kit = {
    v: 1,
    name: typeof payload.name === "string" ? payload.name : "",
    colors: Array.isArray(payload.colors) ? payload.colors : [],
    logo: payload.logo ? true : false,
    site: typeof payload.site === "string" ? payload.site : "",
    bio: typeof payload.bio === "string" ? payload.bio : "",
    exp: payload.exp,
  };
  return bytesToB64Url(text.encode(JSON.stringify(kit)));
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env || {};
  const url = new URL(request.url);
  const secret = env.STUDIO_GATE_SECRET || "";
  const presented = url.searchParams.get("k") || "";
  const cookieToken = readCookieHeader(request.headers.get("cookie"), STUDIO_COOKIE);
  const token = presented || cookieToken;
  const payload = token ? await verifyStudioToken(token, secret) : null;

  if (presented && payload) {
    const clean = new URL(url);
    clean.searchParams.delete("k");
    const maxAge = Math.max(60, payload.exp - Math.floor(Date.now() / 1000));
    const secure = clean.protocol === "https:" ? "; Secure" : "";
    const headers = new Headers();
    headers.set("Location", clean.pathname + clean.search + clean.hash);
    headers.append("Set-Cookie", `${STUDIO_COOKIE}=${presented}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`);
    headers.append("Set-Cookie", `${STUDIO_KIT_COOKIE}=${kitCookie(payload)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`);
    headers.set("Cache-Control", "no-store");
    return new Response(null, { status: 302, headers });
  }

  if (!payload) return gateHtml();
  return context.next();
}

function readCookieHeader(header, name) {
  const source = header || "";
  for (const part of source.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1);
  }
  return "";
}
