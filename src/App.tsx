import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Hero from "./components/Hero";
import ScrollProgress from "./components/ScrollProgress";

const BelowFold = lazy(() => import("./components/BelowFold"));
const InventarioApp = lazy(() => import("./pages/inventario/InventarioApp"));
const Carta = lazy(() => import("./pages/Carta"));

function RouteFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-sm text-[#D4A574]">
      Cargando…
    </main>
  );
}

// La app interna (Mesa Central y su carta QR) no va a Google
function RobotsPorRuta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    if (!meta) return;
    const interna = /^\/(mesa-central|carta)(\/|$)/.test(pathname);
    meta.setAttribute("content", interna ? "noindex, nofollow" : "index, follow, max-image-preview:large");
  }, [pathname]);
  return null;
}

// Las secciones de abajo se piden cuando ya bajó la foto del hero (evento load):
// si compiten con ella por la conexión, el hero tarda medio segundo más en verse.
// Se adelantan si la persona hace scroll o llega con un ancla; a los 3 s van igual.
function useTrasElHero() {
  const [listo, setListo] = useState(
    () => document.readyState === "complete" || window.location.hash.length > 1,
  );
  useEffect(() => {
    if (listo) return;
    const marcar = () => setListo(true);
    const tope = window.setTimeout(marcar, 3000);
    // Mientras solo existe el hero no hay scroll posible: el gesto se detecta por toque, rueda o tecla
    const eventos = ["load", "scroll", "touchstart", "wheel", "keydown"];
    eventos.forEach((e) => window.addEventListener(e, marcar, { once: true, passive: true }));
    return () => {
      window.clearTimeout(tope);
      eventos.forEach((e) => window.removeEventListener(e, marcar));
    };
  }, [listo]);
  return listo;
}

function Home() {
  const trasElHero = useTrasElHero();
  return (
    <main className="bg-black min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <Hero />
      {/* Boundary propio: sin él, el Suspense de la ruta taparía el hero mientras carga */}
      {trasElHero && (
        <Suspense fallback={null}>
          <BelowFold />
        </Suspense>
      )}
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <RobotsPorRuta />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/emulen-pilates" element={<Navigate to="/" replace />} />
        <Route path="/mesa-central/*" element={<InventarioApp />} />
        <Route path="/mesadecontrol/*" element={<Navigate to="/mesa-central" replace />} />
        <Route path="/mesacentral/*" element={<Navigate to="/mesa-central" replace />} />
        <Route path="/carta" element={<Carta />} />
      </Routes>
    </Suspense>
  );
}
