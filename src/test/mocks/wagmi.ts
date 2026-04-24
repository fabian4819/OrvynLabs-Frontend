import { vi } from "vitest";

// Mock wagmi hooks
export const mockUseAccount = {
  address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
  isConnected: true,
  isDisconnected: false,
  isConnecting: false,
  isReconnecting: false,
  status: "connected" as const,
};

export const mockUseBalance = {
  data: {
    decimals: 18,
    formatted: "100.0",
    symbol: "DKT",
    value: BigInt("100000000000000000000"),
  },
  isLoading: false,
  isError: false,
};

export const mockUseReadContract = {
  data: BigInt("100000000000000000000"), // 100 DKT
  isLoading: false,
  isError: false,
};

export const mockUseWriteContract = {
  writeContract: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
};

// Mock wagmi module
vi.mock("wagmi", () => ({
  useAccount: vi.fn(() => mockUseAccount),
  useBalance: vi.fn(() => mockUseBalance),
  useReadContract: vi.fn(() => mockUseReadContract),
  useWriteContract: vi.fn(() => mockUseWriteContract),
  useChainId: vi.fn(() => 17845),
  useBlockNumber: vi.fn(() => ({ data: BigInt(1000) })),
}));
