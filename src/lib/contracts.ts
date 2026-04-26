import { dchain } from "./chains";

// Contract addresses per chain. Fill these in after deploying with forge script.
export const CONTRACT_ADDRESSES = {
  [dchain.id]: {
    diktiToken:        (process.env.NEXT_PUBLIC_DKT_ADDRESS        ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
    stakingVault:      (process.env.NEXT_PUBLIC_STAKING_VAULT      ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
    yieldDistributor:  (process.env.NEXT_PUBLIC_YIELD_DISTRIBUTOR  ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
    fundingPool:       (process.env.NEXT_PUBLIC_FUNDING_POOL       ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
    projectFactory:    (process.env.NEXT_PUBLIC_PROJECT_FACTORY    ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
    dktFaucet:         (process.env.NEXT_PUBLIC_DKT_FAUCET         ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

export function getContracts(chainId: number) {
  const addresses = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  if (!addresses) {
    // Default to DChain addresses when on unsupported network
    return CONTRACT_ADDRESSES[dchain.id];
  }
  return addresses;
}
