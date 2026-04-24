"use client";

import { useAccount } from "wagmi";
import { ConnectPrompt } from "@/components/web3/ConnectPrompt";
import { FadeIn, ParallaxBackground } from "@/components/ui/motion";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { Shield } from "lucide-react";

// Admin addresses (in production, this should be in environment variables)
const ADMIN_ADDRESSES = [
  process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
  // Add more admin addresses as needed
].filter(Boolean);

export default function AdminPage() {
  const { address, isConnected } = useAccount();

  // Check if current user is admin
  const isAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase());

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <ParallaxBackground />
        <FadeIn>
          <ConnectPrompt
            title="Connect wallet to access admin panel"
            description="Admin access required. Connect your authorized wallet."
          />
        </FadeIn>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <ParallaxBackground />
        <FadeIn>
          <div className="flex flex-col items-center justify-center gap-6 py-16 text-center glass-morphism rounded-3xl border border-white/5 p-12">
            <div className="rounded-full bg-red-500/10 p-6">
              <Shield className="h-12 w-12 text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-2xl">Access Denied</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                This area is restricted to authorized administrators only.
              </p>
              <p className="text-muted-foreground text-xs mt-4">
                Connected: {address}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Platform monitoring and management
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Overview Stats */}
        <FadeIn delay={0.1}>
          <AdminOverview />
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.2}>
          <AdminTabs />
        </FadeIn>
      </div>
    </div>
  );
}
