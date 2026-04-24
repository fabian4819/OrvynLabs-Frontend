import { useAccount, usePublicClient, useChainId } from "wagmi";
import { useState, useEffect } from "react";
import type { TransactionType } from "@/app/history/page";

export interface Transaction {
  hash: string;
  type: TransactionType;
  method?: string;
  timestamp: number;
  status: "success" | "failed" | "pending";
  value?: string;
  gasUsed?: bigint;
  blockNumber?: number;
  to?: string;
  from?: string;
}

// For MVP: Parse recent transactions from RPC
// Future: Use a proper indexer/subgraph
export function useTransactionHistory() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Get current block
        const currentBlock = await publicClient.getBlockNumber();

        // Look back ~1000 blocks (adjust based on chain)
        const fromBlock = currentBlock - 1000n > 0n ? currentBlock - 1000n : 0n;

        // Get transactions (this is a simplified version)
        // In production, use an indexer like The Graph or Ponder
        const txs: Transaction[] = [];

        // Get block range
        for (let i = 0; i < 50; i++) {
          try {
            const blockNum = currentBlock - BigInt(i * 20);
            if (blockNum < 0n) break;

            const block = await publicClient.getBlock({
              blockNumber: blockNum,
              includeTransactions: true,
            });

            for (const tx of block.transactions) {
              if (typeof tx === "string") continue;

              // Check if transaction involves our address
              if (
                tx.from.toLowerCase() === address.toLowerCase() ||
                tx.to?.toLowerCase() === address.toLowerCase()
              ) {
                // Get receipt for status and gas
                const receipt = await publicClient.getTransactionReceipt({
                  hash: tx.hash,
                });

                // Try to determine transaction type from method signature
                const type = inferTransactionType(tx.input);

                txs.push({
                  hash: tx.hash,
                  type,
                  method: getMethodName(tx.input),
                  timestamp: Number(block.timestamp),
                  status: receipt.status === "success" ? "success" : "failed",
                  value: tx.value.toString(),
                  gasUsed: receipt.gasUsed,
                  blockNumber: Number(block.number),
                  to: tx.to || undefined,
                  from: tx.from,
                });
              }
            }
          } catch (err) {
            console.error("Error fetching block:", err);
          }
        }

        // Sort by timestamp descending
        txs.sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(txs);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, publicClient, chainId]);

  return {
    transactions,
    isLoading,
  };
}

// Infer transaction type from method selector
function inferTransactionType(data: string): TransactionType {
  if (data.length < 10) return "other";

  const selector = data.slice(0, 10);

  // Common method selectors (first 4 bytes of keccak256)
  const METHOD_MAP: Record<string, TransactionType> = {
    "0xa694fc3a": "stake", // stake(uint256)
    "0x2e1a7d4d": "unstake", // withdraw(uint256)
    "0x4e71d92d": "claim", // claim() / claimYield()
    "0xed88c68e": "donate", // donate(address,uint256)
    "0x0121b93f": "vote", // vote(uint256,bool)
    "0xb61d27f6": "other", // execute(address,uint256,bytes)
  };

  return METHOD_MAP[selector] || "other";
}

// Get human-readable method name
function getMethodName(data: string): string | undefined {
  if (data.length < 10) return undefined;

  const selector = data.slice(0, 10);

  const NAME_MAP: Record<string, string> = {
    "0xa694fc3a": "stake",
    "0x2e1a7d4d": "unstake",
    "0x4e71d92d": "claimYield",
    "0xed88c68e": "donate",
    "0x0121b93f": "vote",
    "0xa9059cbb": "transfer",
    "0x095ea7b3": "approve",
  };

  return NAME_MAP[selector];
}
