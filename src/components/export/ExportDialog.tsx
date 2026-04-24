"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  FileJson,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";
import {
  exportToCSV,
  exportToJSON,
  exportTaxSummary,
  formatTransactionsForExport,
  generateTaxSummary,
  getDateFilename,
  filterByDateRange,
  type ExportTransaction,
} from "@/lib/export";
import { motion } from "framer-motion";

interface ExportDialogProps {
  transactions: ExportTransaction[];
  trigger?: React.ReactNode;
}

export function ExportDialog({ transactions, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getFilteredTransactions = () => {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return filterByDateRange(transactions, start, end);
  };

  const handleExportCSV = () => {
    const filtered = getFilteredTransactions();
    const formatted = formatTransactionsForExport(filtered);
    const headers = [
      "Date",
      "Type",
      "Amount DKT",
      "Status",
      "Gas Used",
      "Transaction Hash",
      "From",
      "To",
    ];
    exportToCSV(formatted, headers, `transactions-${getDateFilename()}.csv`);
  };

  const handleExportJSON = () => {
    const filtered = getFilteredTransactions();
    const data = {
      exportDate: new Date().toISOString(),
      dateRange: {
        start: startDate || "All time",
        end: endDate || "Present",
      },
      transactionCount: filtered.length,
      transactions: filtered,
    };
    exportToJSON(data, `transactions-${getDateFilename()}.json`);
  };

  const handleExportTaxSummary = () => {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const summary = generateTaxSummary(transactions, start, end);
    exportTaxSummary(summary, `tax-summary-${getDateFilename()}.txt`);
  };

  const filtered = getFilteredTransactions();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md glass-morphism">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-400" />
            Export Transaction Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range Selector */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Date Range (Optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                  Start Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                  End Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="w-full text-xs"
              >
                Clear Date Range
              </Button>
            )}
          </div>

          {/* Transaction Count */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm text-muted-foreground">Transactions to export:</span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              {filtered.length}
            </Badge>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Export Format</Label>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={handleExportCSV}
                disabled={filtered.length === 0}
              >
                <FileSpreadsheet className="h-5 w-5 text-green-400" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">CSV Spreadsheet</div>
                  <div className="text-xs text-muted-foreground">
                    Import into Excel, Google Sheets
                  </div>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={handleExportJSON}
                disabled={filtered.length === 0}
              >
                <FileJson className="h-5 w-5 text-blue-400" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">JSON Data</div>
                  <div className="text-xs text-muted-foreground">
                    Raw data for developers
                  </div>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={handleExportTaxSummary}
                disabled={filtered.length === 0}
              >
                <FileText className="h-5 w-5 text-purple-400" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm">Tax Summary</div>
                  <div className="text-xs text-muted-foreground">
                    Formatted summary for tax reporting
                  </div>
                </div>
              </Button>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80 leading-relaxed">
            <strong>Note:</strong> Export data is for personal records. Consult a tax
            professional for official reporting requirements.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
