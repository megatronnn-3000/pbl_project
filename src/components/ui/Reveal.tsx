import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Headline that rises word by word from behind a mask. Pass lines to control breaks. */
export function MaskedHeadline({
  lines,
  className,
  lineClassName,
  delay = 0,
  as: Tag = "h2",
  immediate = false,
}: {
  lines: ReactNode[][];
  className?: string;
  lineClassName?: (index: number) => string | undefined;
  delay?: number;
  as?: "h1" | "h2";
  immediate?: boolean;
}) {
  let wordIndex = 0;
  return (
    <Tag className={className}>
      {lines.map((words, li) => (
        <span key={li} className={cn("block", lineClassName?.(li))}>
          {words.map((word, wi) => {
            const i = wordIndex++;
            const animation = { y: "0%", opacity: 1 };
            return (
              <span key={wi}>
                <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "108%", opacity: 0 }}
                    {...(immediate
                      ? { animate: animation }
                      : { whileInView: animation, viewport: { once: true, margin: "0px 0px -10% 0px" } })}
                    transition={{ duration: 1.05, ease: EASE_OUT_EXPO, delay: delay + i * 0.055 }}
                  >
                    {word}
                  </motion.span>
                </span>
                {wi < words.length - 1 ? " " : null}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
