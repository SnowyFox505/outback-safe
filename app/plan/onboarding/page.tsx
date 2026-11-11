"use client";

import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useHydrated } from "@/lib/useHydrated";

export default function OnboardingPage() {
  const ready = useHydrated();
  if (!ready) return <div className="h-full bg-ink" />;
  return <OnboardingFlow />;
}
