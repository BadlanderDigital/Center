/**
 * Centralized API endpoint configuration.
 *
 * All external service URLs should be defined here so they can be
 * swapped for different environments or self-hosted instances.
 */

/**
 * Studio has no cloud backend. The upstream OpenReel cloud URL was removed
 * in the ShoRebel rebrand (share/upload flows are disabled). This export is
 * kept so existing imports do not break; it must stay an empty string.
 */
export const OPENREEL_CLOUD_URL = "";

/**
 * Third-party API base URLs.
 * These are used by the api-proxy service in dev mode (direct calls)
 * and by the Cloudflare Pages Function proxy in production.
 * Application code should use apiFetch() from services/api-proxy.ts
 * instead of importing these directly.
 */
