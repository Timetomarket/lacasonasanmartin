import { useEffect } from "react";
import ArriendoSpotlight from "./ArriendoSpotlight";
import Features from "./Features";
import CotizarLocal from "./CotizarLocal";
import LeaseFAQ from "./LeaseFAQ";
import Gallery from "./Gallery";
import About from "./About";
import Eventos from "./Eventos";
import Horarios from "./Horarios";
import Contacto from "./Contacto";
import Footer from "./Footer";
import RentalDock from "./RentalDock";

// Todo lo que va debajo del hero llega en un archivo aparte: la portada pinta
// el hero sin esperar el código de estas secciones.
export default function BelowFold() {
  // Si se entra con un ancla (/#emprendedores), la sección recién existe ahora
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <>
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
    </>
  );
}
