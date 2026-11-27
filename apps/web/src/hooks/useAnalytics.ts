import { useCallback } from "react";

type EventProperties = Record<string, string | number | boolean | null>;

const analyticsKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const analyticsHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

/** PostHog is not bundled with ShoRebel Studio. Calls stay no-ops. */
function getAnalyticsClient(): Promise<null> {
  return Promise.resolve(null);
}

export function useAnalytics() {
  const track = useCallback((event: string, properties?: EventProperties) => {
    void event;
    void properties;
    void getAnalyticsClient();
  }, []);

  const identify = useCallback((userId: string, properties?: EventProperties) => {
    void userId;
    void properties;
    void getAnalyticsClient();
  }, []);

  return { track, identify, isEnabled: Boolean(analyticsKey && analyticsHost) };
}

export const AnalyticsEvents = {
  PROJECT_CREATED: "project_created",
  PROJECT_OPENED: "project_opened",
  PROJECT_EXPORTED: "project_exported",
  CLIP_ADDED: "clip_added",
  TEXT_ADDED: "text_added",
  EFFECT_APPLIED: "effect_applied",
  PARTICLE_EFFECT_ADDED: "particle_effect_added",
  TEMPLATE_USED: "template_used",
} as const;
