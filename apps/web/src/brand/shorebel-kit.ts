import { useEffect, useState } from "react";

export type StudioAccess = "checking" | "ok" | "denied";

type StudioKit = {
  name?: string;
  colors?: string[];
  logo?: boolean;
  site?: string;
  bio?: string;
};

const SESSION_KEY = "sr_studio_ok";
const HEX = /^#[0-9a-f]{6}$/i;

function isHex(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

export function studioGateRequired(): boolean {
  if (typeof window === "undefined") return false;
  const desktop = (window as { openreel?: { platform?: string } }).openreel?.platform === "desktop";
  if (desktop) return false;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return false;
  if (host === "studio.shorebel.com") return true;
  return host.endsWith(".pages.dev") && host.split(".")[0].startsWith("studio");
}

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? match[1] : "";
}

function decodeKit(value: string): StudioKit | null {
  try {
    const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
    const b64 = value.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as StudioKit;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function applyStudioKit(kit: StudioKit | null) {
  if (!kit) return;
  try {
    if (typeof kit.name === "string" && kit.name.trim()) localStorage.setItem("openreel-brand-name", kit.name.trim().slice(0, 80));
    const colors = Array.isArray(kit.colors) ? kit.colors.filter(isHex) : [];
    if (colors.length >= 3) {
      const four = [colors[0], colors[1], colors[2], isHex(colors[3]) ? colors[3] : "#111318"];
      localStorage.setItem("openreel-brand-colors", JSON.stringify(four));
    }
    if (kit.logo) localStorage.setItem("openreel-brand-logo", "/api/brand-logo");
    else localStorage.removeItem("openreel-brand-logo");
    if (typeof kit.site === "string") localStorage.setItem("openreel-brand-site", kit.site.slice(0, 300));
    if (typeof kit.bio === "string") localStorage.setItem("openreel-brand-bio", kit.bio.slice(0, 160));
    localStorage.setItem("openreel-brand-source", "shorebel");
  } catch {
    /* private mode still edits in memory for this paint */
  }
  window.dispatchEvent(new Event("shorebel-brand"));
}

export function readPulledBrand(): { logo: boolean; colors: string[] } | null {
  try {
    if (localStorage.getItem("openreel-brand-source") !== "shorebel") return null;
    const parsed: unknown = JSON.parse(localStorage.getItem("openreel-brand-colors") || "null");
    const colors = Array.isArray(parsed) ? parsed.filter(isHex).slice(0, 3) : [];
    return { logo: Boolean(localStorage.getItem("openreel-brand-logo")), colors };
  } catch {
    return null;
  }
}

async function unlockFromToken(token: string): Promise<boolean> {
  const response = await fetch("https://shorebel.com/api/studio-session?k=" + encodeURIComponent(token));
  if (!response.ok) return false;
  const data = (await response.json().catch(() => null)) as { kit?: StudioKit } | null;
  if (!data?.kit) return false;
  applyStudioKit(data.kit);
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.delete("k");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  return true;
}

export async function unlockStudioFromLocation(): Promise<boolean> {
  const token = new URLSearchParams(window.location.search).get("k");
  if (token) return unlockFromToken(token);
  const cookieKit = decodeKit(readCookie("sr_studio_kit"));
  if (cookieKit) {
    applyStudioKit(cookieKit);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    return true;
  }
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function useStudioAccess(): StudioAccess {
  const required = studioGateRequired();
  const [state, setState] = useState<StudioAccess>(required ? "checking" : "ok");
  useEffect(() => {
    if (!required) return;
    let cancelled = false;
    void unlockStudioFromLocation().then((ok) => {
      if (!cancelled) setState(ok ? "ok" : "denied");
    });
    return () => {
      cancelled = true;
    };
  }, [required]);
  return state;
}
