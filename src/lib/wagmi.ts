import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { dchain } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [dchain],
  connectors: [
    injected(),           // MetaMask, Rabby, and any injected wallet
    walletConnect({ projectId }),  // WalletConnect QR code
  ],
  // cookieStorage replaces indexedDB on the server — eliminates the SSR error
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [dchain.id]: http(
      process.env.NEXT_PUBLIC_DCHAIN_RPC ?? "https://mainnet.dchain.id"
    ),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
