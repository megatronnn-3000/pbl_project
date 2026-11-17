import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Eyebrow } from "./primitives";
import { Reveal } from "./Reveal";

export function SectionIntro({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  className,
  id,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn("flex flex-col", centered ? "mx-auto max-w-3xl items-center text-center" : "max-w-3xl", className)}>
      <Reveal>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 id={id} className="mt-7 text-headline font-medium text-fg">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.12}>
          <p className={cn("mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg", centered && "mx-auto")}>
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
