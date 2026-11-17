import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { LogoMark } from "../components/brand/Logo";
import { Button } from "../components/ui/Button";
import { MaskedHeadline, Reveal } from "../components/ui/Reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden py-32 sm:py-40 lg:py-52">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38rem] bg-[radial-gradient(55%_65%_at_50%_100%,rgb(255_106_42/0.13),transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent" />
      <div className="container-page relative flex flex-col items-center text-center">
        <Reveal>
          <LogoMark animated className="size-12 text-fg" />
        </Reveal>
        <div id="cta-title">
          <MaskedHeadline
            className="mt-10 text-display font-medium text-fg"
            lines={[
              [
                "Be",
                "the",
                <>
                  signal<span className="text-ember">.</span>
                </>,
              ],
            ]}
          />
        </div>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-7 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Building on campus, shipping in public or writing the first check — Ignite makes the right introduction obvious.
          </p>
        </Reveal>
        <Reveal delay={0.3} className="mt-10 flex flex-wrap justify-center gap-3">
          <Button to="/explore" size="lg" magnetic icon={<ArrowRight className="size-4" />}>
            Explore Ignite
          </Button>
          <Button to="/investor" variant="secondary" size="lg" magnetic>
            I'm an investor
          </Button>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="mt-12 text-sm text-subtle">
            Running an E-Cell?{" "}
            <Link to="/#trust" className="link-underline text-muted transition-colors hover:text-fg">
              Bring your cohort
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
