"use client";

import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { Agentation } from "agentation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <OnboardingTour />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  );
}
