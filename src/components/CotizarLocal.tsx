import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  Check,
  Dumbbell,
  HelpCircle,
  MessageCircle,
  Palette,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { trackEvent } from "../analytics";

type Tipo = {
  id: string;
  label: string;
  desc: string;
  Icon: React.ElementType;
};

const TIPOS: Tipo[] = [
  { id: "gastronomia", label: "Gastronomía", desc: "Restorán, bar, heladería o repostería", Icon: UtensilsCrossed },
  { id: "retail", label: "Retail / Tienda", desc: "Moda, diseño, artesanía o librería", Icon: ShoppingBag },
  { id: "bienestar", label: "Bienestar", desc: "Yoga, pilates, masajes o salud", Icon: Dumbbell },
  { id: "arte", label: "Arte & Cultura", desc: "Galería, taller o estudio creativo", Icon: Palette },
  { id: "servicios", label: "Servicios", desc: "Estética, peluquería o consultoría", Icon: Briefcase },
  { id: "otro", label: "Otra idea", desc: "Cuéntanos tu propuesta", Icon: HelpCircle },
];

const STEPS = [
  {
    number: "01",
    title: "Preséntanos tu negocio",
    text: "Cuéntanos el rubro y cómo imaginas tu proyecto dentro de la Casona.",
  },
  {
    number: "02",
    title: "Recorre los espacios",
    text: "Coordinamos una visita para conocer el lugar y resolver tus preguntas.",
  },
  {
    number: "03",
    title: "Revisa una propuesta",
    text: "Con el espacio definido, conversamos las condiciones para tu proyecto.",
  },
];

const ADMIN_WA = "56992650514";
const DIRECT_WA =
  "https://wa.me/56992650514?text=" +
  encodeURIComponent(
    "Hola, quiero conocer los locales disponibles en Casona San Martín y agendar una visita.",
  );

export default function CotizarLocal() {
  const [tipo, setTipo] = useState("");
  const [concepto, setConcepto] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [sent, setSent] = useState(false);

  const phoneDigits = telefono.replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 8 && phoneDigits.length <= 12;
  const isValid = Boolean(tipo && nombre.trim().length >= 2 && phoneValid && consent);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    const tipoLabel = TIPOS.find((item) => item.id === tipo)?.label ?? tipo;
    const details = concepto.trim()
      ? `\n*Idea o necesidad:* ${concepto.trim()}`
      : "";
    const message =
      `Hola, quiero agendar una visita para conocer los locales de Casona San Martín.\n\n` +
      `*Tipo de negocio:* ${tipoLabel}${details}\n` +
      `*Nombre:* ${nombre.trim()}\n` +
      `*Teléfono:* ${telefono.trim()}` +
      (marketing ? `\n*Acepta recibir novedades:* Sí` : ``);

    trackEvent("generate_lead", {
      lead_type: "local_comercial",
      method: "whatsapp",
      business_category: tipo,
    });
    window.open(
      `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSent(true);
  };

  return (
    <section id="cotizar" className="relative bg-black px-4 py-14 sm:px-6 sm:py-20">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="mb-10 max-w-3xl sm:mb-12"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[#D4A574] sm:text-xs">
            Agenda una visita
          </p>
          <h2 className="font-serif text-4xl font-normal leading-[0.98] text-[#E1E0CC] sm:text-5xl lg:text-6xl">
            Conoce el lugar antes de tomar una decisión.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            Déjanos tus datos esenciales. Te contactaremos por WhatsApp para coordinar un recorrido y conversar sobre tu proyecto.
          </p>
        </motion.div>

        <div className="grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101010] lg:grid-cols-[0.78fr_1.22fr] lg:rounded-[2.25rem]">
          <motion.aside
            className="relative overflow-hidden bg-[#e6dfcf] px-6 py-9 text-[#1b1713] sm:px-9 sm:py-11 lg:px-10 lg:py-12"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c66b50]/10 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f432f]">
                <CalendarCheck className="h-3.5 w-3.5" />
                Así funciona
              </span>
              <h3 className="mt-6 font-serif text-3xl leading-[1.02] sm:text-4xl">
                Un recorrido simple,
                <span className="block italic text-[#98523f]">sin formularios eternos.</span>
              </h3>

              <ol className="mt-9 space-y-7">
                {STEPS.map((step) => (
                  <li key={step.number} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span className="pt-0.5 text-[10px] font-semibold tracking-[0.16em] text-[#98523f]">
                      {step.number}
                    </span>
                    <div>
                      <p className="font-serif text-lg leading-tight">{step.title}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#665d55]">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-9 border-t border-black/10 pt-7">
                <p className="text-xs leading-relaxed text-[#665d55]">
                  ¿Prefieres escribir directamente?
                </p>
                <a
                  href={DIRECT_WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("click_whatsapp", {
                      cta_location: "rental_form_sidebar",
                      lead_type: "local_comercial",
                    })
                  }
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-black/20 px-4 text-sm font-semibold transition-colors hover:bg-white/45"
                >
                  <MessageCircle className="h-4 w-4" />
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </motion.aside>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-8 px-5 py-8 sm:px-9 sm:py-10 lg:px-10 lg:py-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4A574]">
                  Tu proyecto
                </p>
                <p className="text-[10px] text-gray-600">Campos esenciales *</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {TIPOS.map((item) => {
                  const active = tipo === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTipo(item.id)}
                      className={`relative min-h-[96px] rounded-2xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
                        active
                          ? "border-[#D4A574] bg-[#D4A574]/10"
                          : "border-white/10 bg-[#161616] hover:border-white/25"
                      }`}
                    >
                      <item.Icon className={`mb-2.5 h-4 w-4 ${active ? "text-[#D4A574]" : "text-gray-600"}`} />
                      <p className={`font-serif text-sm leading-tight ${active ? "text-[#E1E0CC]" : "text-gray-400"}`}>
                        {item.label}
                      </p>
                      <p className={`mt-1 hidden text-[10px] leading-snug sm:block ${active ? "text-[#D4A574]/80" : "text-gray-600"}`}>
                        {item.desc}
                      </p>
                      {active && (
                        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4A574] text-black">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs text-gray-500">Nombre o empresa *</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#161616] px-4 py-3.5 text-sm text-[#E1E0CC] outline-none transition-colors placeholder:text-gray-600 focus:border-[#D4A574]/60"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs text-gray-500">WhatsApp / Teléfono *</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+56 9 XXXX XXXX"
                  value={telefono}
                  onChange={(event) => setTelefono(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#161616] px-4 py-3.5 text-sm text-[#E1E0CC] outline-none transition-colors placeholder:text-gray-600 focus:border-[#D4A574]/60"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 flex items-center justify-between gap-4 text-xs text-gray-500">
                <span>Cuéntanos tu idea</span>
                <span className="text-[10px] text-gray-600">Opcional</span>
              </span>
              <textarea
                rows={3}
                placeholder="Qué ofreces, qué público buscas o qué espacio imaginas…"
                value={concepto}
                onChange={(event) => setConcepto(event.target.value)}
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#161616] px-4 py-3.5 text-sm text-[#E1E0CC] outline-none transition-colors placeholder:text-gray-600 focus:border-[#D4A574]/60"
              />
            </label>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4A574]"
                />
                <span className="text-xs leading-relaxed text-gray-400">
                  Autorizo a Casona San Martín a usar estos datos para responder mi solicitud. He leído la{" "}
                  <a
                    href="/politica-privacidad.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D4A574] underline"
                  >
                    Política de Privacidad
                  </a>
                  . *
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(event) => setMarketing(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4A574]"
                />
                <span className="text-xs leading-relaxed text-gray-500">
                  (Opcional) Quiero recibir novedades y actividades de la Casona.
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xs text-[11px] leading-relaxed text-gray-600">
                El mensaje se abrirá en WhatsApp. No necesitas tener todos los detalles resueltos.
              </p>
              <button
                type="submit"
                disabled={!isValid}
                className="group inline-flex min-h-12 shrink-0 items-center justify-between gap-4 rounded-full bg-[#D4A574] py-1.5 pl-5 pr-1.5 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
              >
                <span>{sent ? "WhatsApp abierto" : "Coordinar mi visita"}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[#D4A574]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
