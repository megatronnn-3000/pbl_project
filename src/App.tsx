import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router";
import { AppShell, PageLoader } from "./components/layout/AppShell";
import Landing from "./pages/Landing";

const Explore = lazy(() => import("./pages/Explore"));
const StartupProfile = lazy(() => import("./pages/StartupProfile"));
const InvestorDashboard = lazy(() => import("./pages/InvestorDashboard"));
const CopilotPage = lazy(() => import("./pages/CopilotPage"));
const DealRoomPage = lazy(() => import("./pages/DealRoomPage"));
const PitchPage = lazy(() => import("./pages/PitchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const APP_PATHS = ["/explore", "/startup", "/investor", "/copilot", "/deal-room", "/pitch"];

export default function App() {
  const location = useLocation();
  // Landing and product share one transition; navigation inside the product animates only the page body.
  const group = APP_PATHS.some((p) => location.pathname.startsWith(p)) ? "app" : location.pathname === "/" ? "landing" : "other";

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-fg px-4 py-2 text-sm font-medium text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="grain">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}>
          <motion.div
            key={group}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Suspense fallback={<PageLoader />}>
              <Routes location={location}>
                <Route path="/" element={<Landing />} />
                <Route element={<AppShell />}>
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/startup/:id" element={<StartupProfile />} />
                  <Route path="/investor" element={<InvestorDashboard />} />
                  <Route path="/copilot" element={<CopilotPage />} />
                  <Route path="/deal-room" element={<DealRoomPage />} />
                  <Route path="/pitch/:id" element={<PitchPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
