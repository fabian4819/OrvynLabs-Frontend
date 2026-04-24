"use client";

import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <OnboardingTour />
    </>
  );
}
