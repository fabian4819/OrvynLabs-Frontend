"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import { usePathname } from "next/navigation";

const TOUR_KEY = "onboarding_tour_completed";

interface TourStep {
  target?: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Orvyn-Labs! 🚀",
    description: "A decentralized platform for research crowdfunding on DChain blockchain. Let's take a quick tour to get you started!",
    position: "center",
  },
  {
    target: "[data-tour='connect-wallet']",
    title: "Connect Your Wallet",
    description: "Click here to connect your Web3 wallet (MetaMask recommended). You'll need DKT tokens to interact with the platform.",
    position: "bottom",
  },
  {
    target: "[data-tour='projects']",
    title: "Explore Projects",
    description: "Browse research projects from universities and researchers. Each project is a smart contract with milestone-based funding.",
    position: "bottom",
  },
  {
    target: "[data-tour='stake']",
    title: "Stake & Earn",
    description: "Stake your DKT tokens to earn rewards. Support the platform while generating passive income through yield farming.",
    position: "bottom",
  },
  {
    target: "[data-tour='analytics']",
    title: "Track Analytics",
    description: "View platform statistics, project performance, and your contribution history in real-time.",
    position: "bottom",
  },
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem(TOUR_KEY);
    if (!tourCompleted && pathname === "/") {
      // Show tour after a short delay for first-time visitors on home page
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    const step = TOUR_STEPS[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);
    } else {
      setTargetElement(null);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setIsVisible(false);
  };

  const skipTour = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={skipTour}
            />

            {/* Highlight for target element */}
            {targetElement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed z-[101] pointer-events-none"
                style={{
                  top: targetElement.offsetTop - 8,
                  left: targetElement.offsetLeft - 8,
                  width: targetElement.offsetWidth + 16,
                  height: targetElement.offsetHeight + 16,
                  border: "3px solid rgb(59, 130, 246)",
                  borderRadius: "12px",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                }}
              />
            )}

            {/* Tour Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed z-[102] w-full max-w-md ${
                step.position === "center"
                  ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  : targetElement
                  ? getPositionStyle(targetElement, step.position)
                  : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              }`}
            >
              <div className="glass-morphism border border-blue-500/30 rounded-2xl shadow-2xl p-6 space-y-6 mx-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-blue-400" />
                      <h3 className="font-bold text-lg">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <button
                    onClick={skipTour}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Step {currentStep + 1} of {TOUR_STEPS.length}
                    </span>
                    <span>{Math.round(((currentStep + 1) / TOUR_STEPS.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
                      }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    className="text-muted-foreground hover:text-white"
                  >
                    Skip Tour
                  </Button>
                  <div className="flex items-center gap-2">
                    {!isFirstStep && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </Button>
                    )}
                    <Button size="sm" onClick={handleNext} className="gap-2">
                      {isLastStep ? "Finish" : "Next"}
                      {!isLastStep && <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function getPositionStyle(element: HTMLElement, position: string): string {
  const rect = element.getBoundingClientRect();

  switch (position) {
    case "bottom":
      return `top-[${rect.bottom + 16}px] left-[${rect.left}px]`;
    case "top":
      return `bottom-[${window.innerHeight - rect.top + 16}px] left-[${rect.left}px]`;
    case "left":
      return `top-[${rect.top}px] right-[${window.innerWidth - rect.left + 16}px]`;
    case "right":
      return `top-[${rect.top}px] left-[${rect.right + 16}px]`;
    default:
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}

// Helper component to reset tour (for testing)
export function ResetTourButton() {
  const handleReset = () => {
    localStorage.removeItem(TOUR_KEY);
    window.location.reload();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleReset}>
      Reset Onboarding Tour
    </Button>
  );
}
