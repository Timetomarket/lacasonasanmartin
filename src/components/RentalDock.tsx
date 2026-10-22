import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarCheck, MessageCircle } from "lucide-react";
import { trackEvent } from "../analytics";

const WHATSAPP_URL =
  "https://wa.me/56992650514?text=" +
  encodeURIComponent(
    "Hola, quiero conocer los locales disponibles en Casona San Martín y agendar una visita.",
  );

export default function RentalDock() {
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const updateScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.68);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    const form = document.getElementById("cotizar");
    const observer = form
      ? new IntersectionObserver(
          ([entry]) => setFormVisible(entry.isIntersecting),
          { threshold: 0.08 },
        )
      : null;
    if (form && observer) observer.observe(form);

    return () => {
      window.removeEventListener("scroll", updateScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {pastHero && !formVisible && (
        <motion.aside
          aria-label="Acciones para arrendar un local"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-[680px] items-center gap-3 rounded-2xl border border-white/10 bg-[#111]/95 p-2.5 shadow-2xl backdrop-blur-2xl [-webkit-backdrop-filter:blur(24px)] sm:bottom-5 sm:rounded-full sm:pl-5"
        >
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4A574]/10 text-[#D4A574] sm:flex">
            <CalendarCheck className="h-4 w-4" />
          </span>
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate font-serif text-sm text-[#E1E0CC]">¿Imaginando tu negocio aquí?</p>
            <p className="truncate text-[10px] text-gray-500">Conoce los espacios antes de decidir.</p>
          </div>
          <a
            href="#cotizar"
            onClick={() =>
              trackEvent("select_content", {
                content_type: "rental_cta",
                item_id: "sticky_agendar_visita",
              })
            }
            className="group inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#D4A574] px-4 text-sm font-semibold text-black sm:flex-none"
          >
            Agendar visita
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar disponibilidad por WhatsApp"
            onClick={() =>
              trackEvent("click_whatsapp", {
                cta_location: "sticky_rental_dock",
                lead_type: "local_comercial",
              })
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#E1E0CC] transition-colors hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
