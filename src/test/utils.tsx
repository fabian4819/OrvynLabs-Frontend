import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";

// Mock messages for testing
const mockMessages = {
  common: {
    loading: "Loading...",
    connect: "Connect Wallet",
    submit: "Submit",
    cancel: "Cancel",
  },
  nav: {
    projects: "Projects",
    stake: "Stake",
    analytics: "Analytics",
    leaderboard: "Leaderboard",
    history: "History",
    favorites: "Favorites",
    profile: "Profile",
    help: "Help",
  },
};

interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <NextIntlClientProvider locale="en" messages={mockMessages}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };
