/** HMAC session tokens shared with ShoRebel /api/studio-session. Keep the algorithm identical. */

const text = new TextEncoder();

export function bytesToB64Url(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i += 1) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function b64UrlToBytes(value) {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret, usages) {
  return crypto.subtle.importKey("raw", text.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);
}

export async function signStudioToken(payload, secret) {
  const body = bytesToB64Url(text.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, text.encode(body)));
  return `${body}.${bytesToB64Url(sig)}`;
}

export async function verifyStudioToken(token, secret) {
  if (!secret || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  let sig;
  try {
    sig = b64UrlToBytes(parts[1]);
  } catch {
    return null;
  }
  const key = await hmacKey(secret, ["verify"]);
  const ok = await crypto.subtle.verify("HMAC", key, sig, text.encode(parts[0]));
  if (!ok) return null;
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64UrlToBytes(parts[0])));
  } catch {
    return null;
  }
  if (!payload || payload.v !== 1 || typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export function readCookie(header, name) {
  const source = header || "";
  const parts = source.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1);
  }
  return "";
}

export const STUDIO_COOKIE = "sr_studio";
export const STUDIO_KIT_COOKIE = "sr_studio_kit";
