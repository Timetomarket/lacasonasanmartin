import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Hero from "./components/Hero";
import ArriendoSpotlight from "./components/ArriendoSpotlight";
import ScrollProgress from "./components/ScrollProgress";
import About from "./components/About";
import Gallery from "./components/Gallery";
import Features from "./components/Features";
import Eventos from "./components/Eventos";
import Horarios from "./components/Horarios";
import CotizarLocal from "./components/CotizarLocal";
import LeaseFAQ from "./components/LeaseFAQ";
import Contacto from "./components/Contacto";
import Footer from "./components/Footer";
import RentalDock from "./components/RentalDock";

const InventarioApp = lazy(() => import("./pages/inventario/InventarioApp"));
const Carta = lazy(() => import("./pages/Carta"));

function RouteFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-sm text-[#D4A574]">
      Cargando…
    </main>
  );
}

function Home() {
  return (
    <main className="bg-black min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <Hero />
      <ArriendoSpotlight />
      <Features />
      <CotizarLocal />
      <LeaseFAQ />
      <Gallery />
      <About />
      <Eventos />
      <Horarios />
      <Contacto />
      <Footer />
      <RentalDock />
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
