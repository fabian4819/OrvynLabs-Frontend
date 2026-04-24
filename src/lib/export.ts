/**
 * Data export utilities for CSV, JSON, and formatted reports
 */

import { formatDkt } from "./utils";

export interface ExportTransaction {
  timestamp: number;
  date: string;
  type: string;
  amount: bigint;
  hash: string;
  status: string;
  gasUsed?: bigint;
  from?: string;
  to?: string;
}

export interface ExportOptions {
  filename: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: any[],
  headers: string[],
  filename: string = "export.csv"
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create CSV content
  const csvRows = [headers.join(",")];

  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header.toLowerCase().replace(/ /g, "_")];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value || "").replace(/"/g, '""');
      return escaped.includes(",") ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(","));
  });

  const csvContent = csvRows.join("\n");

  // Create download
  downloadFile(csvContent, filename, "text/csv");
}

/**
 * Export data to JSON format
 */
export function exportToJSON(
  data: any,
  filename: string = "export.json"
): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, "application/json");
}

/**
 * Create download for file content
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format transaction data for export
 */
export function formatTransactionsForExport(
  transactions: ExportTransaction[]
): any[] {
  return transactions.map((tx) => ({
    date: tx.date,
    type: tx.type,
    amount_dkt: formatDkt(tx.amount),
    status: tx.status,
    gas_used: tx.gasUsed ? formatDkt(tx.gasUsed) : "N/A",
    transaction_hash: tx.hash,
    from: tx.from || "N/A",
    to: tx.to || "N/A",
  }));
}

/**
 * Generate transaction summary for tax purposes
 */
export interface TaxSummary {
  totalDonations: bigint;
  totalStaked: bigint;
  totalUnstaked: bigint;
  totalRewardsClaimed: bigint;
  totalGasPaid: bigint;
  transactionCount: number;
  period: {
    start: string;
    end: string;
  };
}

export function generateTaxSummary(
  transactions: ExportTransaction[],
  startDate?: Date,
  endDate?: Date
): TaxSummary {
  let totalDonations = 0n;
  let totalStaked = 0n;
  let totalUnstaked = 0n;
  let totalRewardsClaimed = 0n;
  let totalGasPaid = 0n;

  const filtered = transactions.filter((tx) => {
    const txDate = new Date(tx.timestamp);
    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;
    return true;
  });

  filtered.forEach((tx) => {
    if (tx.gasUsed) totalGasPaid += tx.gasUsed;

    switch (tx.type) {
      case "donate":
      case "donation":
        totalDonations += tx.amount;
        break;
      case "stake":
        totalStaked += tx.amount;
        break;
      case "unstake":
        totalUnstaked += tx.amount;
        break;
      case "claim":
      case "claimRewards":
        totalRewardsClaimed += tx.amount;
        break;
    }
  });

  return {
    totalDonations,
    totalStaked,
    totalUnstaked,
    totalRewardsClaimed,
    totalGasPaid,
    transactionCount: filtered.length,
    period: {
      start: startDate?.toISOString() || "All time",
      end: endDate?.toISOString() || "Present",
    },
  };
}

/**
 * Export tax summary as formatted text
 */
export function exportTaxSummary(
  summary: TaxSummary,
  filename: string = "tax-summary.txt"
): void {
  const content = `
ORVYN-LABS TAX SUMMARY
======================

Period: ${summary.period.start} to ${summary.period.end}

TRANSACTIONS
------------
Total Transactions: ${summary.transactionCount}

DONATIONS
---------
Total Donated: ${formatDkt(summary.totalDonations)}

STAKING ACTIVITY
----------------
Total Staked: ${formatDkt(summary.totalStaked)}
Total Unstaked: ${formatDkt(summary.totalUnstaked)}
Net Staked: ${formatDkt(summary.totalStaked - summary.totalUnstaked)}

REWARDS
-------
Total Rewards Claimed: ${formatDkt(summary.totalRewardsClaimed)}

GAS COSTS
---------
Total Gas Paid: ${formatDkt(summary.totalGasPaid)}

NOTES
-----
- All amounts in DKT (Dikti Token)
- Consult tax professional for reporting requirements
- This is a generated summary and not official tax advice
- Keep transaction hashes for verification

Generated: ${new Date().toISOString()}
Platform: Orvyn-Labs DApp
Network: DChain (Chain ID: 17845)
`.trim();

  downloadFile(content, filename, "text/plain");
}

/**
 * Filter data by date range
 */
export function filterByDateRange<T extends { timestamp: number }>(
  data: T[],
  startDate?: Date,
  endDate?: Date
): T[] {
  return data.filter((item) => {
    const itemDate = new Date(item.timestamp);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });
}

/**
 * Get current date formatted for filename
 */
export function getDateFilename(): string {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
}
