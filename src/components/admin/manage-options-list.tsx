"use client";

import { useState, KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ManageOption {
  value: string;
  label: string;
  color?: string;
}

export function ManageOptionsList({
  items,
  onAdd,
  onRemove,
  addPlaceholder = "Add new...",
}: {
  items: ManageOption[];
  onAdd: (label: string) => void;
  onRemove: (value: string) => void;
  addPlaceholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mt-2.5 flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item.value}
            className={cn(
              "flex items-center gap-1.5 rounded-full border border-line bg-void py-1 pl-2.5 pr-1.5 text-xs text-ink-dim"
            )}
          >
            {item.color && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            )}
            {item.label}
            <button
              type="button"
              onClick={() => onRemove(item.value)}
              aria-label={`Remove ${item.label}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-ink-faint hover:bg-ink/10 hover:text-accent-red"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={addPlaceholder}
          className="h-8 flex-1 rounded-full border border-line bg-void px-3 text-xs text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          aria-label="Add option"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-dim hover:border-ink-faint hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
