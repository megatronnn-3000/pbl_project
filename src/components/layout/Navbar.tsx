import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router";
import { scrollToHash } from "../../lib/scroll";
import { cn } from "../../lib/utils";
import { Logo } from "../brand/Logo";
import { Button } from "../ui/Button";

const links = [
  { label: "Product", href: "#proof" },
  { label: "For Founders", href: "#tracks" },
  { label: "For Investors", href: "#investors" },
  { label: "E-Cells", href: "#trust" },
  { label: "How It Works", href: "#story" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 12));

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setOpen(false);
    history.replaceState(null, "", href);
    requestAnimationFrame(() => scrollToHash(href));
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500",
        open
          ? "border-line bg-canvas/[0.97] backdrop-blur-xl"
          : scrolled
            ? "border-line bg-canvas/70 backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent",
      )}
    >
      <nav aria-label="Primary" className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" aria-label="Ignite home" className="rounded-md">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(event) => go(event, link.href)}
                className="link-underline pb-0.5 text-[13.5px] text-muted transition-colors duration-300 hover:text-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <Link
            to="/investor"
            className="hidden rounded-full px-3 py-1.5 text-[13.5px] text-muted transition-colors duration-300 hover:text-fg sm:inline-flex"
          >
            Log in
          </Link>
          <Button to="/explore" variant="light" size="sm" className="hidden sm:inline-flex">
            Explore startups
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-full text-fg transition-colors hover:bg-white/5 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="container-page flex h-full flex-col justify-between pb-10 pt-4">
              <ul>
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.045, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={link.href}
                      onClick={(event) => go(event, link.href)}
                      className="flex items-center justify-between border-b border-line py-5 text-2xl font-medium tracking-tight text-fg"
                    >
                      {link.label}
                      <ArrowUpRight className="size-5 text-subtle" aria-hidden />
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-col gap-3">
                <Button to="/explore" size="lg" icon={<ArrowRight className="size-4" />}>
                  Explore startups
                </Button>
                <Button to="/investor" variant="secondary" size="lg">
                  Log in
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
