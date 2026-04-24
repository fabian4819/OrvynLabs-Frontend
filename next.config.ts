import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // WalletConnect's ethereum-provider uses browser-only APIs (indexedDB, WebSocket)
  // at module load time. Exclude it from the SSR bundle so it only runs client-side.
  serverExternalPackages: [
    "@walletconnect/ethereum-provider",
    "@walletconnect/universal-provider",
    "@walletconnect/core",
    "@walletconnect/sign-client",
  ],
};

export default withNextIntl(nextConfig);
