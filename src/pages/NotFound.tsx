import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "../components/brand/Logo";
import { Button } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Signal lost — Ignite");
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="container-page flex h-16 items-center">
        <Link to="/" aria-label="Ignite home">
          <Logo />
        </Link>
      </header>
      <main id="main" className="container-page grid flex-1 place-items-center pb-24 text-center">
        <div>
          <p className="eyebrow text-ember">404 · No signal</p>
          <h1 className="mt-7 text-headline font-medium">Signal lost.</h1>
          <p className="mx-auto mt-6 max-w-sm text-muted">This page doesn't exist — or it was noise all along.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button to="/" icon={<ArrowRight className="size-4" />}>
              Back to Ignite
            </Button>
            <Button to="/explore" variant="secondary">
              Explore startups
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
