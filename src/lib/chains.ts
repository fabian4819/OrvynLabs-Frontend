import { defineChain } from "viem";

/**
 * DChain Mainnet
 * @see https://dchain.id/explorer
 */
export const dchain = defineChain({
  id: 17845,
  name: "DChain",
  nativeCurrency: {
    name: "DCoin",
    symbol: "DCoin",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.dchain.id"],
    },
    public: {
      http: ["https://mainnet.dchain.id"],
    },
  },
  blockExplorers: {
    default: {
      name: "DChain Explorer",
      url: "https://dchain.id/explorer",
    },
  },
  contracts: {
    // Add multicall3 if DChain supports it
    // multicall3: {
    //   address: "0x...",
    //   blockCreated: 1,
    // },
  },
});
