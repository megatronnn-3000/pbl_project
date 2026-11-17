import { motion, useSpring } from "motion/react";
import type { ButtonHTMLAttributes, MouseEvent, PointerEvent, ReactNode } from "react";
import { Link } from "react-router";
import { useFinePointer, useReducedMotionPref } from "../../hooks/useMediaQuery";
import { cn } from "../../lib/utils";

type Variant = "primary" | "light" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ember text-ember-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_12px_32px_-14px_rgb(255_106_42/0.7)] hover:bg-ember-bright",
  light: "bg-fg text-canvas hover:bg-white",
  secondary: "bg-white/[0.035] text-fg ring-1 ring-inset ring-white/10 hover:bg-white/[0.07] hover:ring-white/20",
  ghost: "text-muted hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3.5 text-[13px]",
  md: "h-10 gap-2 px-4.5 text-sm",
  lg: "h-12 gap-2.5 px-6 text-[15px]",
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "onClick"> {
  to?: string;
  href?: string;
  variant?: Variant;
  size?: Size;
  /** Drifts toward the cursor on fine pointers. Reserved for hero-level calls to action. */
  magnetic?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export function Button({
  to,
  href,
  variant = "primary",
  size = "md",
  magnetic = false,
  icon,
  className,
  children,
  onClick,
  type = "button",
  ...rest
}: ButtonProps) {
  const reduced = useReducedMotionPref();
  const finePointer = useFinePointer();
  const magnet = magnetic && finePointer && !reduced;
  const x = useSpring(0, { stiffness: 260, damping: 20, mass: 0.5 });
  const y = useSpring(0, { stiffness: 260, damping: 20, mass: 0.5 });

  const classes = cn(
    "group relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,color,box-shadow] duration-300 disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {icon && (
        <span aria-hidden className="-mr-0.5 inline-flex transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  );

  let element: ReactNode;
  if (to) {
    element = (
      <Link to={to} className={classes} onClick={onClick} aria-label={rest["aria-label"]}>
        {content}
      </Link>
    );
  } else if (href) {
    element = (
      <a href={href} className={classes} onClick={onClick} aria-label={rest["aria-label"]}>
        {content}
      </a>
    );
  } else {
    element = (
      <button type={type} className={classes} onClick={onClick} {...rest}>
        {content}
      </button>
    );
  }

  if (!magnet) return element;

  return (
    <motion.span
      className="inline-flex"
      style={{ x, y }}
      onPointerMove={(event: PointerEvent<HTMLSpanElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.24);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.34);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {element}
    </motion.span>
  );
}
