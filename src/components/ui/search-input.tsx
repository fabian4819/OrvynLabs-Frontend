"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { Search, Clock, X } from "lucide-react";
import { getSearchHistory, addToSearchHistory, removeFromSearchHistory } from "@/lib/searchHistory";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search...", className }: SearchInputProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleInputFocus = () => {
    setHistory(getSearchHistory());
    if (history.length > 0 && !value) {
      setShowHistory(true);
    }
  };

  const handleSelectHistory = (query: string) => {
    onChange(query);
    addToSearchHistory(query);
    setShowHistory(false);
  };

  const handleRemoveHistory = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromSearchHistory(query);
    setHistory(getSearchHistory());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      addToSearchHistory(value);
      setHistory(getSearchHistory());
      setShowHistory(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
        <Input
          placeholder={placeholder}
          className={cn("pl-11 h-12 rounded-2xl glass-morphism border-white/10 focus:border-blue-500/50 transition-all shadow-inner text-sm", className)}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
        />
      </div>

      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full glass-morphism border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-2 border-b border-white/10">
              <div className="flex items-center gap-2 px-2 py-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Searches</span>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {history.map((query, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelectHistory(query)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-white/5 transition-colors group/item"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{query}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemoveHistory(query, e)}
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                    title="Remove from history"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
