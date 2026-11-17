import { motion } from "motion/react";
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  const indicatorId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = options.findIndex((o) => o.value === value);
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % options.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + options.length) % options.length;
    if (next !== current) {
      event.preventDefault();
      onChange(options[next].value);
      refs.current[next]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("relative inline-flex rounded-full border border-line bg-white/[0.02] p-1", className)}
    >
      {options.map((option, i) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-0 flex h-8 items-center gap-1.5 rounded-full px-3.5 font-mono text-micro uppercase tracking-[0.12em] transition-colors duration-300",
              active ? "text-fg" : "text-subtle hover:text-muted",
            )}
          >
            {active && (
              <motion.span
                layoutId={indicatorId}
                className="absolute inset-0 -z-10 rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/10"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
