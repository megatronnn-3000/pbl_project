import { ArrowRight, CornerDownLeft, LayoutGrid, Search, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { startups } from "../../data/startups";
import { cn } from "../../lib/utils";
import { Monogram } from "../ui/primitives";

interface Item {
  id: string;
  group: "Startups" | "Navigate" | "Copilot";
  label: string;
  hint: string;
  to: string;
  monogram?: string;
}

const pages: Item[] = [
  { id: "explore", group: "Navigate", label: "Explore startups", hint: "Discover and map", to: "/explore" },
  { id: "investor", group: "Navigate", label: "Investor dashboard", hint: "24 high-signal matches", to: "/investor" },
  { id: "deal-room", group: "Navigate", label: "Deal room", hint: "NOVA × Halcyon Ventures", to: "/deal-room" },
  { id: "pitch", group: "Navigate", label: "Pitch analytics", hint: "NOVA deck v3", to: "/pitch/nova" },
  { id: "home", group: "Navigate", label: "Ignite home", hint: "Landing page", to: "/" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      returnFocus.current?.focus?.();
    }
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (item: Item) => !q || `${item.label} ${item.hint}`.toLowerCase().includes(q);
    const startupItems: Item[] = startups.map((s) => ({
      id: s.id,
      group: "Startups",
      label: s.name,
      hint: `${s.warmth}% warm · ${s.industry} · ${s.stage}`,
      to: `/startup/${s.id}`,
      monogram: s.monogram,
    }));
    const ask: Item = {
      id: "ask",
      group: "Copilot",
      label: q ? `Ask Copilot: “${query.trim()}”` : "Ask Copilot to find investors",
      hint: "Thesis parsing and warm-path ranking",
      to: q ? `/copilot?q=${encodeURIComponent(query.trim())}` : "/copilot",
    };
    return [...startupItems.filter(match).slice(0, 5), ...pages.filter(match), ask];
  }, [query]);

  const select = (item: Item) => {
    onClose();
    navigate(item.to);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((a) => (a - 1 + items.length) % items.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[active];
      if (item) select(item);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "Tab") {
      event.preventDefault();
    }
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="window relative w-full max-w-xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-subtle" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                placeholder="Search startups, pages, or ask Copilot…"
                aria-label="Search"
                aria-controls="command-list"
                aria-activedescendant={items[active] ? `cmd-${items[active].id}` : undefined}
                className="h-14 flex-1 bg-transparent text-[15px] text-fg placeholder:text-subtle focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-nano text-subtle">ESC</kbd>
            </div>
            <ul id="command-list" role="listbox" aria-label="Results" className="scroll-thin max-h-[52vh] overflow-y-auto p-2">
              {items.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                return (
                  <li key={`${item.group}-${item.id}`} role="presentation">
                    {header && <p className="eyebrow px-3 pb-2 pt-3 text-subtle">{header}</p>}
                    <div
                      id={`cmd-${item.id}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => select(item)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                        i === active ? "bg-white/[0.06]" : "",
                      )}
                    >
                      {item.monogram ? (
                        <Monogram letter={item.monogram} size="sm" />
                      ) : (
                        <span className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-muted ring-1 ring-inset ring-white/5">
                          {item.group === "Copilot" ? <Sparkles className="size-4 text-ember" /> : <LayoutGrid className="size-4" />}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-fg">{item.label}</span>
                        <span className="block truncate text-xs text-subtle">{item.hint}</span>
                      </span>
                      {i === active ? (
                        <CornerDownLeft className="size-3.5 text-subtle" aria-hidden />
                      ) : (
                        <ArrowRight className="size-3.5 text-faint" aria-hidden />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
