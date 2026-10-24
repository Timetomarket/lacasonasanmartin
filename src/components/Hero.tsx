import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { trackEvent } from "../analytics";

// Entrada en video: la fachada del logo abre su puerta y la cámara entra al corredor real
// (Kling 3.0 con la foto del corredor como cuadro final). Dura 5 s, va una vez y sin sonido,
// y queda en el último cuadro. Con «menos movimiento» o ahorro de datos no se baja: se ve la foto
const REDUCE =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SIN_VIDEO =
  REDUCE ||
  (typeof navigator !== "undefined" &&
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData === true);

const NAV_ITEMS = [
  { label: "Nuestra Historia", href: "#historia" },
  { label: "Eventos", href: "#eventos" },
  { label: "Marcas", href: "#emprendedores" },
  { label: "Agendar visita", href: "#cotizar" },
  { label: "Contacto", href: "#contacto" },
];

function MaskedWord({
  word,
  delay,
  className = "",
}: {
  word: string;
  delay: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block overflow-hidden ${className}`}
      style={{ lineHeight: "inherit" }}
    >
      <motion.span
        className="inline-block"
        initial={{ y: "105%", rotateX: -15 }}
        animate={{ y: "0%", rotateX: 0 }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Mouse parallax
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 25, damping: 18 });
  const springY = useSpring(rawY, { stiffness: 25, damping: 18 });
  const imgX = useTransform(springX, [-1, 1], ["-2.5%", "2.5%"]);
  const imgY = useTransform(springY, [-1, 1], ["-2.5%", "2.5%"]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [rawX, rawY]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<"espera" | "corre" | "fallo">(
    SIN_VIDEO ? "fallo" : "espera"
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v || SIN_VIDEO) return;
    let visible = true;
    let partio = false;
    const falla = () => setVideo("fallo");
    const intenta = () => {
      if (!partio || v.ended || document.hidden || !visible) return;
      // AbortError = una pausa nuestra cortó el play(): no es falla. NotAllowedError (iPhone
      // en ahorro de batería) sí: se muestra la foto en vez de quedar pegado en la puerta
      v.play()?.catch((e: DOMException) => {
        if (e.name !== "AbortError") falla();
      });
    };
    const arranca = () => {
      partio = true;
      v.preload = "auto";
      v.load();
      intenta();
    };
    v.querySelector("source:last-of-type")?.addEventListener("error", falla);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) intenta();
        else if (!v.paused) v.pause();
      },
      { threshold: 0.4 }
    );
    io.observe(v);
    const alCambiarPestana = () => (document.hidden ? v.pause() : intenta());
    document.addEventListener("visibilitychange", alCambiarPestana);
    // El video se pide recién con la página cargada: no le pelea la red al primer cuadro (el LCP)
    const ocioso =
      window.requestIdleCallback ??
      ((f: () => void) => window.setTimeout(f, 200));
    const enCarga = () => ocioso(arranca, { timeout: 1500 });
    if (document.readyState === "complete") enCarga();
    else window.addEventListener("load", enCarga, { once: true });
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", alCambiarPestana);
      window.removeEventListener("load", enCarga);
    };
  }, []);

  // Hide scroll indicator on scroll
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  return (
    <>
      {/* Sin cortina negra de entrada: la foto ya viene pintada desde el index.html */}
      <section ref={sectionRef} className="h-[100svh] w-full p-4 md:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">

          {/* Parallax image wrapper */}
          <motion.div
            className="hero-lqip absolute inset-[-5%]"
            style={{ x: imgX, y: imgY }}
          >
            {/* El acercamiento lento va en una capa que lleva la puerta, el video y la foto
                juntos: así el video no salta al tomar el lugar del primer cuadro. Es suave
                (1,02 → 1,08) porque el video ya trae su movimiento de cámara */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.02 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: 22, ease: "easeOut" }}
            >
              <picture className="block h-full w-full">
                {/* Mismas fuentes y orden que el marco del index.html, para que React reuse la
                    imagen ya bajada. Con «menos movimiento» va la foto del corredor (el JPG pesaba
                    531 KB: AVIF/WebP con tope de 1200 px en el celular). Si no, la puerta cerrada,
                    que es el cuadro 0 del video: es el LCP y pesa menos que la foto */}
                <source
                  type="image/avif"
                  media="(prefers-reduced-motion: reduce) and (max-width: 768px)"
                  srcSet="/photos/hero-800.avif 1x, /photos/hero-1200.avif 2x"
                />
                <source
                  type="image/avif"
                  media="(prefers-reduced-motion: reduce)"
                  srcSet="/photos/hero-800.avif 800w, /photos/hero-1200.avif 1200w, /photos/hero-1500.avif 1500w"
                  sizes="130vw"
                />
                <source
                  type="image/webp"
                  media="(prefers-reduced-motion: reduce) and (max-width: 768px)"
                  srcSet="/photos/hero-800.webp 1x, /photos/hero-1200.webp 2x"
                />
                <source
                  type="image/webp"
                  media="(prefers-reduced-motion: reduce)"
                  srcSet="/photos/hero-800.webp 800w, /photos/hero-1200.webp 1200w, /photos/hero-1500.webp 1500w"
                  sizes="130vw"
                />
                <source
                  type="image/avif"
                  media="(max-width: 768px)"
                  srcSet="/video/puerta-movil-720.avif 1x, /video/puerta-movil-1080.avif 2x"
                />
                <source
                  type="image/avif"
                  srcSet="/video/puerta-1280.avif 1280w, /video/puerta-1920.avif 1920w"
                  sizes="120vw"
                />
                <source
                  type="image/webp"
                  media="(max-width: 768px)"
                  srcSet="/video/puerta-movil-720.webp 1x, /video/puerta-movil-1080.webp 2x"
                />
                <source
                  type="image/webp"
                  srcSet="/video/puerta-1280.webp 1280w, /video/puerta-1920.webp 1920w"
                  sizes="120vw"
                />
                <img
                  src="/photos/hero.jpg"
                  alt="Casona San Martín: su puerta de madera se abre hacia el corredor y el jardín"
                  className="h-full w-full object-cover"
                />
              </picture>

              {!SIN_VIDEO && (
                <video
                  ref={videoRef}
                  className={`absolute inset-0 h-full w-full object-cover ${
                    video === "corre" ? "opacity-100" : "opacity-0"
                  }`}
                  muted
                  playsInline
                  preload="none"
                  aria-hidden="true"
                  onPlaying={() => setVideo("corre")}
                >
                  {/* Vertical en el celular y horizontal en pantallas anchas, cada una con
                      su propio recorrido de cámara. AV1 primero, H.264 de respaldo */}
                  <source src="/video/intro-movil.av1.mp4" type='video/mp4; codecs="av01.0.05M.08"' media="(max-width: 768px)" />
                  <source src="/video/intro-movil.hevc.mp4" type='video/mp4; codecs="hvc1.1.6.L93.B0"' media="(max-width: 768px)" />
                  <source src="/video/intro-movil.h264.mp4" type='video/mp4; codecs="avc1.64001F"' media="(max-width: 768px)" />
                  <source src="/video/intro-1600.av1.mp4" type='video/mp4; codecs="av01.0.08M.08"' />
                  <source src="/video/intro-1280.hevc.mp4" type='video/mp4; codecs="hvc1.1.6.L93.B0"' />
                  <source src="/video/intro-1280.h264.mp4" type='video/mp4; codecs="avc1.64001F"' />
                </video>
              )}

              {/* Sin video (ahorro de datos, autoplay bloqueado, archivo que no carga): la foto
                  del corredor tapa la puerta. Con «menos movimiento» ya la trae el <picture> */}
              {video === "fallo" && !REDUCE && (
                <motion.picture
                  className="absolute inset-0 block h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <source
                    type="image/avif"
                    media="(max-width: 768px)"
                    srcSet="/photos/hero-800.avif 1x, /photos/hero-1200.avif 2x"
                  />
                  <source
                    type="image/avif"
                    srcSet="/photos/hero-800.avif 800w, /photos/hero-1200.avif 1200w, /photos/hero-1500.avif 1500w"
                    sizes="130vw"
                  />
                  <img
                    src="/photos/hero.jpg"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </motion.picture>
              )}
            </motion.div>
          </motion.div>

          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/90" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
          {/* Scrim inferior reforzado: asegura contraste del título grande sobre zonas claras (sobre todo en móvil) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

          {/* Ambient glow bottom */}
          <motion.div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3"
            style={{
              background:
                "radial-gradient(ellipse at 30% 100%, rgba(212,165,116,0.08) 0%, transparent 70%)",
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Nav escritorio — staggered entrance */}
          <nav aria-label="Navegación principal" className="hidden sm:block absolute left-1/2 top-0 z-20 -translate-x-1/2 bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8">
            <ul className="flex gap-5 md:gap-10 lg:gap-12">
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.45 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <a
                    href={item.href}
                    className="text-xs md:text-sm transition-colors whitespace-nowrap"
                    style={{ color: "rgba(225, 224, 204, 0.8)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#E1E0CC")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")
                    }
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Nav móvil — hamburguesa + drawer */}
          <div className="sm:hidden absolute top-3 right-3 z-30">
            <motion.button
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center rounded-full bg-black/70 backdrop-blur-md p-2.5 border border-white/10"
              style={{ color: "#E1E0CC" }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
            <AnimatePresence>
              {menuOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-60 origin-top-right rounded-2xl bg-black/95 backdrop-blur-md p-2 border border-white/10 shadow-2xl"
                >
                  {NAV_ITEMS.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-4 py-3 text-sm transition-colors hover:bg-white/5"
                        style={{ color: "rgba(225, 224, 204, 0.9)" }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Logo badge */}
          <motion.div
            className="hidden md:flex absolute top-6 left-6 z-20 items-center gap-3 bg-black/55 backdrop-blur-md rounded-full p-2 lg:pr-5"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src="/photos/logo-casona-480.webp"
              alt="Casona San Martín"
              // En el celular este bloque va oculto: lazy evita que le quite banda a la foto
              loading="lazy"
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white p-1 object-contain ring-1 ring-primary/40"
            />
            <span
              className="hidden lg:inline-flex flex-col"
              style={{ color: "#E1E0CC" }}
            >
              <span className="font-serif text-base leading-tight">
                Casona San Martín
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "#D4A574" }}
              >
                Rinconada de los Andes
              </span>
            </span>
          </motion.div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-10 pb-6 md:pb-10">
            <div className="grid grid-cols-12 items-end gap-6">
              <div className="col-span-12 lg:col-span-8">

                {/* Animated line above title */}
                <div className="overflow-hidden mb-4 hidden sm:block">
                  <motion.div
                    className="h-[1px] w-24"
                    style={{ background: "#D4A574", originX: 0 }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </div>

                {/* Title — word-by-word masked reveal */}
                <h1
                  className="font-serif font-medium leading-[0.85] tracking-[-0.04em] text-[22vw] sm:text-[20vw] md:text-[18vw] lg:text-[16vw] xl:text-[15vw] flex flex-wrap gap-x-[0.2em]"
                  style={{ color: "#E1E0CC", perspective: "1000px" }}
                >
                  <MaskedWord word="Casona" delay={0.12} />
                  <MaskedWord word="San" delay={0.2} />
                  <MaskedWord word="Martín" delay={0.28} />
                </h1>

                {/* Subtitle with underline draw */}
                <div className="mt-3 overflow-hidden">
                  <motion.p
                    className="font-serif italic text-base sm:text-lg md:text-xl"
                    style={{ color: "#D4A574" }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.38,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    Rinconada de Los Andes
                  </motion.p>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 lg:pb-6">
                <motion.p
                  className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary sm:text-xs"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.65, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                >
                  Arriendo de locales comerciales
                </motion.p>
                <motion.p
                  className="text-cream/85 text-xs sm:text-sm md:text-base"
                  style={{ lineHeight: 1.4 }}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.48,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  Tu negocio merece un lugar con alma — y con clientes que ya
                  están aquí. Un patrimonio colonial del Valle de Aconcagua
                  donde cuatro emprendimientos ya tienen su lugar. El próximo
                  puede ser el tuyo.
                </motion.p>

                <motion.a
                  href="#cotizar"
                  onClick={() =>
                    trackEvent("select_content", {
                      content_type: "rental_cta",
                      item_id: "hero_agendar_visita",
                    })
                  }
                  className="group inline-flex items-center justify-between gap-2 hover:gap-3 transition-all bg-primary text-black font-medium text-sm sm:text-base rounded-full pl-5 sm:pl-6 pr-1.5 py-1.5 self-start"
                  initial={{ y: 24, opacity: 0, scale: 0.97 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.58,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>Agendar visita</span>
                  <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                    <ArrowRight
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: "#D4A574" }}
                    />
                  </span>
                </motion.a>
                <motion.a
                  href="#arriendo"
                  className="inline-flex w-fit items-center gap-2 text-xs font-medium text-cream/75 underline decoration-white/25 underline-offset-4 transition-colors hover:text-cream sm:text-sm"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.65, delay: 0.68 }}
                >
                  Ver espacios y beneficios
                  <ChevronDown className="h-4 w-4" />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
            style={{ opacity: indicatorOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <span
              className="text-[9px] uppercase tracking-[0.25em]"
              style={{ color: "rgba(212,165,116,0.6)" }}
            >
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown
                className="w-4 h-4"
                style={{ color: "rgba(212,165,116,0.6)" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
