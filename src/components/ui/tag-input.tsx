"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "./input";
import { Badge } from "./badge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
  tags,
  onChange,
  maxTags = 5,
  placeholder = "Add tags...",
  disabled,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove last tag on backspace
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().toLowerCase();

    if (!trimmed) return;
    if (tags.length >= maxTags) return;
    if (tags.includes(trimmed)) return;

    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-white/10 bg-white/5 min-h-[48px]">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className="bg-blue-500/20 text-blue-400 border-blue-500/30 pl-2 pr-1 flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-blue-500/30 rounded p-0.5 transition-colors"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {tags.length < maxTags && (
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 bg-transparent p-0 h-7 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Enter</kbd> or{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">,</kbd> to add tag
        </p>
        <p>
          {tags.length} / {maxTags} tags
        </p>
      </div>
    </div>
  );
}
