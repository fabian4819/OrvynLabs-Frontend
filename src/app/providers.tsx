"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider, type State } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextIntlClientProvider } from "next-intl";

interface ProvidersProps {
  children: React.ReactNode;
  initialState?: State;
  locale: string;
  messages: any;
}

// Use dark theme by default for RainbowKit
const rainbowKitTheme = darkTheme({
  accentColor: "#3b82f6",
  accentColorForeground: "white",
  borderRadius: "medium",
});

export function Providers({ children, initialState, locale, messages }: ProvidersProps) {
  // useState to avoid sharing QueryClient across requests in SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2_000,
            refetchInterval: 2_000, // Base produces a block ~every 2s
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <NotificationProvider>
          <WagmiProvider config={wagmiConfig} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider theme={rainbowKitTheme}>
                <TooltipProvider delayDuration={200}>
                  {children}
                </TooltipProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </NotificationProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
