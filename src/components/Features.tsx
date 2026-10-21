import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Check, CalendarCheck } from "lucide-react";
import { trackEvent } from "../analytics";
import InstagramIcon from "./icons/InstagramIcon";
import WordsPullUpMultiStyle from "./WordsPullUpMultiStyle";

type Brand = {
  number: string;
  name: string;
  tagline: string;
  logo: string;
  logoBg: string;
  logoFit: "contain" | "cover";
  logoClass?: string;
  items: string[];
  href: string;
  ig: string;
  badge?: string;
};

const BRANDS: Brand[] = [
  {
    number: "01",
    name: "Pizzería Di María",
    tagline: "Pizza artesanal al horno",
    logo: "/photos/logo-dimaria.jpg",
    logoBg: "bg-black",
    logoFit: "contain",
    items: [
      "Pizzas artesanales auténticas",
      "Cervezas heladas y tragos",
      "Fútbol en vivo",
    ],
    href: "/pizzeria-di-maria.html",
    ig: "https://www.instagram.com/pizzasdimariaaconcagua/",
  },
  {
    number: "02",
    name: "Punto Origen",
    tagline: "Cafetería de especialidad",
    logo: "/photos/punto-origen.webp",
    logoBg: "bg-[#1c120a]",
    logoFit: "cover",
    items: [
      "Café de especialidad",
      "Espresso y bebidas de autor",
      "Recién llegada a la Casona",
    ],
    href: "/cafeteria-punto-origen.html",
    ig: "https://www.instagram.com/cafeteriapuntoorigen/",
    badge: "Nuevo",
  },
  {
    number: "03",
    name: "Taller Balbina",
    tagline: "Uniformes escolares",
    logo: "/photos/logo-taller-balbina.jpg",
    logoBg: "bg-[#f5f1e8]",
    logoFit: "cover",
    items: [
      "Uniformes escolares",
      "Taller de costura en la Casona",
      "Atención de lunes a sábado",
    ],
    href: "/taller-balbina-uniformes-escolares.html",
    ig: "https://www.instagram.com/taller_balbina/",
  },
  {
    number: "04",
    name: "Alisados Studio",
    tagline: "Alisados y cuidado del cabello",
    logo: "/photos/logo-alisados-studio.jpg",
    logoBg: "bg-[#141414]",
    logoFit: "cover",
    items: [
      "Alisados de cabello",
      "Atención con reserva previa",
      "Lunes a sábado",
    ],
    href: "/alisados-studio-rinconada.html",
    ig: "https://www.instagram.com/alisadostudio_/",
  },
  {
    number: "05",
    name: "Bartemon 157",
    tagline: "Smashburgers & bar",
    logo: "/photos/logo-bartemon157.jpg",
    logoBg: "bg-black",
    logoFit: "contain",
    logoClass: "h-full w-full",
    items: [
      "Smashburgers de 120 g a la plancha",
      "Hamburguesas, papas y coctelería",
      "Próxima apertura en Casona San Martín",
    ],
    href: "/bartemon157/",
    ig: "https://www.instagram.com/bartemon157/",
    badge: "Próximamente",
  },
];

type CardProps = {
  index: number;
  children: React.ReactNode;
  className?: string;
};

function Card({ index, children, className = "" }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative overflow-hidden rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  return (
    <Card index={index} className="bg-[#161616] p-6 sm:p-7 flex flex-col h-full">
      {brand.badge && (
        <span
          className="absolute top-3 right-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: "#D4A574", color: "#1a120a" }}
        >
          {brand.badge}
        </span>
      )}
      <div
        className={`relative w-full aspect-[4/3] rounded-xl ${brand.logoBg} flex items-center justify-center ${brand.logo && brand.logoFit === "contain" ? "p-5" : ""} mb-5 overflow-hidden`}
      >
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={`Logo de ${brand.name} — ${brand.tagline}, en Casona San Martín, Rinconada de Los Andes`}
            loading="lazy"
            className={`${brand.logoFit === "contain" ? "max-w-full max-h-full object-contain" : "w-full h-full object-cover"} ${brand.logoClass ?? ""}`}
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-center px-4">
            <span
              className="font-serif text-2xl sm:text-3xl leading-none"
              style={{ color: "#E1E0CC" }}
            >
              {brand.name}
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.3em]"
              style={{ color: "#D4A574" }}
            >
              {brand.tagline}
            </span>
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <h3
          className="font-serif text-lg sm:text-xl font-medium leading-tight"
          style={{ color: "#E1E0CC" }}
        >
          {brand.name}
        </h3>
        <span className="text-xs text-gray-500 shrink-0">{brand.number}</span>
      </div>
      <p
        className="text-xs sm:text-sm italic mb-4"
        style={{ color: "#D4A574" }}
      >
        {brand.tagline}
      </p>
      <ul className="flex-1 space-y-2.5">
        {brand.items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <Check
              className="w-4 h-4 mt-[2px] shrink-0"
              style={{ color: "#D4A574" }}
            />
            <span className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {it}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs sm:text-sm">
        <a
          href={brand.href}
          aria-label={`Ver la página web de ${brand.name}`}
          onClick={() =>
            trackEvent("select_content", {
              content_type: "tenant_link",
              item_id: brand.name.toLowerCase().replace(/\s+/g, "_"),
            })
          }
          className="inline-flex items-center gap-2 group"
          style={{ color: "#D4A574" }}
        >
          Ver página web
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            style={{ transform: "rotate(-45deg)" }}
          />
        </a>
        <a
          href={brand.ig}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Instagram de ${brand.name}`}
          onClick={() =>
            trackEvent("select_content", {
              content_type: "tenant_instagram",
              item_id: brand.name.toLowerCase().replace(/\s+/g, "_"),
            })
          }
          className="inline-flex items-center gap-1.5 group"
          style={{ color: "#D4A574" }}
        >
          <InstagramIcon size={14} />
          <span className="group-hover:underline">Instagram</span>
        </a>
      </div>
    </Card>
  );
}

export default function Features() {
  return (
    <section
      id="emprendedores"
      className="relative bg-black py-14 sm:py-20 px-4 sm:px-6"
    >
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.1]">
          <WordsPullUpMultiStyle
            segments={[
              {
                text: "Cinco marcas. Un mismo patio colonial.",
                className: "text-cream",
              },
              {
                text: "Cada una con su historia. Una nueva está por comenzar.",
                className: "italic text-[#E1E0CC]/70",
              },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5 max-w-7xl mx-auto">
          {BRANDS.map((brand, i) => (
            <BrandCard key={brand.number} brand={brand} index={i} />
          ))}
        </div>

        <motion.div
          className="mx-auto mt-8 flex max-w-7xl flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-[#111] px-5 py-5 sm:flex-row sm:items-center sm:px-7"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4A574]/10 text-[#D4A574]">
              <CalendarCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="font-serif text-lg text-[#E1E0CC] sm:text-xl">
                ¿Tu marca podría ser la próxima?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-400 sm:text-sm">
                Agenda un recorrido y revisemos si tu propuesta encaja con la comunidad de la Casona.
              </p>
            </div>
          </div>
          <a
            href="#cotizar"
            onClick={() =>
              trackEvent("select_content", {
                content_type: "rental_cta",
                item_id: "brands_agendar_visita",
              })
            }
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#D4A574] px-5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
          >
            Quiero conocer los espacios
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
