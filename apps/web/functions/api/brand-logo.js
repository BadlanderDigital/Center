import { STUDIO_COOKIE, verifyStudioToken } from "../_studio-token.js";

function readCookie(header, name) {
  const source = header || "";
  for (const part of source.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1);
  }
  return "";
}

export async function onRequest(context) {
  const request = context.request;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }
  const secret = context.env?.STUDIO_GATE_SECRET || "";
  const token = readCookie(request.headers.get("cookie"), STUDIO_COOKIE);
  const payload = await verifyStudioToken(token, secret);
  const logo = payload && typeof payload.logo === "string" ? payload.logo : "";
  if (!payload || !/^https:\/\//i.test(logo)) {
    return new Response("No brand logo", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  let upstream;
  try {
    upstream = await fetch(logo, { redirect: "follow", headers: { Accept: "image/*" } });
  } catch {
    return new Response("Logo unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
  if (!upstream.ok) return new Response("Logo unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  const type = upstream.headers.get("content-type") || "";
  if (!type.toLowerCase().startsWith("image/")) {
    return new Response("Logo unavailable", { status: 415, headers: { "Cache-Control": "no-store" } });
  }
  const length = Number(upstream.headers.get("content-length") || "0");
  if (length > 2_000_000) return new Response("Logo too large", { status: 413 });
  const bytes = new Uint8Array(await upstream.arrayBuffer());
  if (bytes.byteLength > 2_000_000) return new Response("Logo too large", { status: 413 });
  return new Response(request.method === "HEAD" ? null : bytes, {
    status: 200,
    headers: {
      "Content-Type": type.split(";")[0],
      "Cache-Control": "private, max-age=300",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
