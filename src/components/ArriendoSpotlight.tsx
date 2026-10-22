import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  CarFront,
  MapPinned,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { trackEvent } from "../analytics";

const WHATSAPP_URL =
  "https://wa.me/5692650514?text=" +
  encodeURIComponent(
    "Hola, quiero conocer los locales disponibles en Casona San Martín y agendar una visita.",
  );

const PROOF = [
  {
    Icon: MapPinned,
    title: "Ubicación reconocible",
    text: "Carretera San Martín 421, en el corazón de Rinconada.",
  },
  {
    Icon: CarFront,
    title: "Estacionamiento",
    text: "Llegada cómoda para clientes, equipos y proveedores.",
  },
  {
    Icon: Sparkles,
    title: "Comunidad activa",
    text: "Gastronomía, café, belleza y eventos en un mismo lugar.",
  },
];

const IDEAL_FOR = ["Gastronomía", "Bienestar", "Retail", "Servicios creativos"];

export default function ArriendoSpotlight() {
  return (
    <section id="arriendo" className="bg-black px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.75rem] bg-[#e6dfcf] lg:grid-cols-[1.04fr_0.96fr] lg:rounded-[2.5rem]">
        <motion.div
          className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-black/15 bg-white/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#6f432f]">
            <CalendarCheck className="h-3.5 w-3.5" />
            Locales comerciales · Rinconada
          </div>

          <h2 className="max-w-2xl font-serif text-4xl leading-[0.98] tracking-[-0.035em] text-[#17130f] sm:text-5xl lg:text-6xl">
            Tu próximo negocio no parte de cero.
            <span className="mt-2 block italic text-[#98523f]">
              Parte con un lugar que ya tiene historia.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#4f473f] sm:text-base">
            Instálate en un patio patrimonial que las personas ya visitan para
            comer, entrenar, encontrarse y vivir panoramas. Cuéntanos tu idea y
            revisemos juntos qué espacio calza mejor.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Rubros ideales para los locales">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#776c62]">
              Ideal para
            </span>
            {IDEAL_FOR.map((item) => (
              <span
                key={item}
                className="rounded-full border border-black/15 bg-white/35 px-3 py-1.5 text-[11px] font-medium text-[#3d342d]"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#cotizar"
              onClick={() =>
                trackEvent("select_content", {
                  content_type: "rental_cta",
                  item_id: "spotlight_agendar_visita",
                })
              }
              className="group inline-flex min-h-12 items-center justify-between gap-4 rounded-full bg-[#17130f] py-2 pl-5 pr-2 text-sm font-semibold text-[#f4eee2] transition-transform hover:-translate-y-0.5"
            >
              Agendar una visita
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c66b50]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("click_whatsapp", {
                  cta_location: "arriendo_spotlight",
                  lead_type: "local_comercial",
                })
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/20 px-5 py-2 text-sm font-semibold text-[#2f2923] transition-colors hover:bg-white/50"
            >
              <MessageCircle className="h-4 w-4" />
              Consultar por WhatsApp
            </a>
            <a
              href="/arriendo-locales-rinconada.html"
              onClick={() =>
                trackEvent("select_content", {
                  content_type: "rental_guide",
                  item_id: "spotlight_guia_arriendo",
                })
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#6f432f] underline decoration-[#98523f]/35 underline-offset-4 transition-colors hover:text-[#2f2923]"
            >
              Ver guía de arriendo
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 grid gap-3 border-t border-black/10 pt-7 sm:grid-cols-3">
            {PROOF.map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-3 sm:block">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#98523f] sm:mb-3" />
                <div>
                  <p className="text-xs font-semibold text-[#211c18]">{title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#6b625a]">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[11px] leading-relaxed text-[#776c62]">
            La disponibilidad y las condiciones de cada espacio se confirman durante la visita.
          </p>
        </motion.div>

        <motion.div
          className="relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-full"
          initial={{ opacity: 0, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <picture>
            <source
              type="image/webp"
              srcSet="/photos/patio-600.webp 600w, /photos/patio-900.webp 900w, /photos/patio-1204.webp 1204w"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          <img
            src="/photos/patio.jpg"
            alt="Patio colonial con espacios comerciales en Casona San Martín"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-black/65 p-5 text-[#f4eee2] backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-6 [-webkit-backdrop-filter:blur(24px)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d9a27f]">
              Una visita cambia la perspectiva
            </p>
            <p className="mt-2 max-w-md font-serif text-2xl leading-tight sm:text-3xl">
              Recorre los espacios y visualiza tu marca dentro de la Casona.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
