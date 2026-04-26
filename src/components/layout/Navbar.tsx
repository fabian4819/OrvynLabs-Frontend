"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChainId, useAccount, useReadContract } from "wagmi";
import { cn, formatDkt } from "@/lib/utils";
import { DiktiTokenAbi } from "@/lib/abis";
import { getContracts } from "@/lib/contracts";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useTranslations } from "next-intl";


const NAV_LINKS = [
  { href: "/projects", key: "projects" },
  { href: "/stake", key: "stake" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/history", key: "history" },
  { href: "/favorites", key: "favorites" },
  { href: "/faucet", key: "faucet" },
  { href: "/help", key: "help" },
] as const;

function DktBalance() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const { data: balance } = useReadContract({
    address: contracts.diktiToken,
    abi: DiktiTokenAbi,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: isConnected && !!address },
  });

  if (!isConnected || balance === undefined) return null;

  return (
    <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground border border-border rounded-full px-3 py-1">
      <span className="w-2 h-2 rounded-full bg-blue-500" />
      {formatDkt(balance)}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { address, isConnected } = useAccount();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo and Brand Name */}
          <Link href="/" className="shrink-0 flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Orvyn-Labs Logo"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="hidden sm:inline font-bold text-base text-white leading-none">Orvyn-Labs</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
            {NAV_LINKS.map(({ href, key }) => {
              // Add data-tour attributes for onboarding
              const getTourAttr = () => {
                if (href === "/projects") return "projects";
                if (href === "/stake") return "stake";
                return undefined;
              };

              return (
                <Link
                  key={href}
                  href={href}
                  data-tour={getTourAttr()}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
                    pathname.startsWith(href)
                      ? "text-white bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  {t(key)}
                </Link>
              );
            })}
            {/* Profile link - shows only when connected */}
            {isConnected && address && (
              <Link
                href={`/profile/${address}`}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
                  pathname.startsWith("/profile")
                    ? "text-white bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {t("profile")}
              </Link>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
            <div className="flex items-center gap-3 scale-90 sm:scale-100 origin-right" data-tour="connect-wallet">
              <DktBalance />
              <ConnectButton
                accountStatus="avatar"
                chainStatus="icon"
                showBalance={false}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
