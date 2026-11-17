import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export function FilterMenu({
  label,
  options,
  selected,
  onChange,
  single = false,
  isActive,
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  single?: boolean;
  /** Override for single-select menus whose default value shouldn't count as active. */
  isActive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const activeCount = single ? (isActive ? 1 : 0) : selected.length;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleOpen = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setAlignRight(rect.left + 264 > window.innerWidth - 16);
    setOpen((value) => !value);
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggleOpen}
        className={cn(
          "flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] transition-colors duration-300",
          activeCount ? "border-ember/40 bg-ember/[0.06] text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
        )}
      >
        {label}
        {activeCount > 0 && !single && (
          <span className="grid size-4 place-items-center rounded-full bg-ember text-[10px] font-medium text-ember-ink">{activeCount}</span>
        )}
        <ChevronDown className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="group"
            aria-label={`${label} filter`}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "absolute top-11 z-30 w-64 max-w-[calc(100vw-2.5rem)] rounded-xl border border-line-strong bg-overlay/95 p-1.5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl",
              alignRight ? "right-0 origin-top-right" : "left-0 origin-top-left",
            )}
          >
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
                >
                  <input
                    type={single ? "radio" : "checkbox"}
                    name={single ? panelId : undefined}
                    checked={checked}
                    onChange={() => {
                      if (single) onChange([option.value]);
                      else onChange(checked ? selected.filter((v) => v !== option.value) : [...selected, option.value]);
                    }}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-4 shrink-0 place-items-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ember peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-overlay",
                      single ? "rounded-full" : "rounded-[4px]",
                      checked ? "border-ember bg-ember" : "border-line-strong",
                    )}
                  >
                    {checked && (single ? <span className="size-1.5 rounded-full bg-ember-ink" /> : <Check className="size-3 text-ember-ink" strokeWidth={3} />)}
                  </span>
                  <span className={cn("flex-1", checked && "text-fg")}>{option.label}</span>
                  {option.count !== undefined && <span className="font-mono text-nano tabular-nums text-subtle">{option.count}</span>}
                </label>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
