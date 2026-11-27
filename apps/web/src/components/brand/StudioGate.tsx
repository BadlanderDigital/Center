import { StudioLockup } from "./StudioLockup";

/** Shown when studio.shorebel.com is opened without a Station session. */
export function StudioGate() {
  return (
    <div className="h-screen w-screen bg-background text-text-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <StudioLockup size="lg" />
        </div>
        <p className="text-base text-text-secondary leading-relaxed">
          Studio is included on Station. Open it from the ShoRebel menu once this workspace is on Station.
        </p>
        <a
          href="https://shorebel.com/upgrade?for=studio"
          className="inline-flex items-center justify-center mt-6 h-10 px-5 rounded-full bg-primary text-primary-foreground font-semibold"
        >
          View Station
        </a>
      </div>
    </div>
  );
}
