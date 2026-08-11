"use client";

import { useEffect, useId, useRef, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  /** Form-field style: full-width trigger, menu matches trigger width exactly. */
  fullWidth?: boolean;
  /** Small pill trigger, e.g. an inline status control inside a table row. */
  compact?: boolean;
}

/**
 * Premium replacement for a native <select>, used everywhere on the site
 * a dropdown is needed (shop sort, admin forms, checkout, contact, order
 * status). Same trigger styling family as the rest of the site's pill/field
 * controls, a themed floating menu matching the navbar's mega-menu
 * treatment, and the standard WAI-ARIA listbox keyboard pattern (Arrow
 * keys, Home/End, Enter/Space, Escape, roving focus).
 */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  fullWidth = false,
  compact = false,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listboxId = useId();
  const buttonId = useId();

  const selected = options.find((o) => o.value === value) ?? options[0];

  const close = (focusButton = false) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };

  const commit = (index: number) => {
    const opt = options[index];
    if (!opt) return;
    onChange(opt.value);
    close(true);
  };

  // Click-outside + Escape close.
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Keep the active (highlighted) option in view and focused for screen readers.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
      setOpen(true);
    }
  };

  const handleOptionKeyDown = (e: KeyboardEvent<HTMLLIElement>, index: number) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(index);
        break;
      case "Escape":
        e.preventDefault();
        close(true);
        break;
      case "Tab":
        close();
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", fullWidth && "w-full", className)}>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => {
          if (!open) setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
          setOpen((o) => !o);
        }}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          "flex items-center gap-2 border border-line text-ink transition-colors hover:border-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void",
          compact
            ? "rounded-full bg-void px-2.5 py-1 text-xs"
            : cn("h-11 rounded-xl bg-void px-4 text-sm", !fullWidth && "rounded-full bg-surface"),
          fullWidth && "w-full justify-between"
        )}
      >
        <span className={cn("whitespace-nowrap", fullWidth && "truncate")}>{selected.label}</span>
        <ChevronDown
          className={cn(
            "shrink-0 text-ink-faint transition-transform duration-200",
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-labelledby={buttonId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute z-40 mt-2 origin-top-right rounded-2xl border border-line bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl focus:outline-none",
              fullWidth
                ? "left-0 right-0 w-full"
                : compact
                  ? "right-0 min-w-[9rem]"
                  : "right-0 w-[calc(100vw-2.5rem)] max-w-[240px]"
            )}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isActive = i === activeIndex;
              return (
                <li
                  key={opt.value}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={isActive ? 0 : -1}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => commit(i)}
                  onKeyDown={(e) => handleOptionKeyDown(e, i)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus:outline-none",
                    compact && "px-2.5 py-2 text-xs",
                    isSelected ? "bg-accent-purple/15 text-accent-purple" : "text-ink-dim",
                    isActive && !isSelected && "bg-ink/5 text-ink"
                  )}
                >
                  {opt.label}
                  {isSelected && <Check className={cn("shrink-0", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
