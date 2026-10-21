import { motion } from "framer-motion";

const QUESTIONS = [
  {
    question: "¿Qué tipo de negocios pueden instalarse en la Casona?",
    answer:
      "Buscamos propuestas que complementen la experiencia del lugar: gastronomía, tiendas, bienestar, servicios, arte y proyectos creativos. También puedes presentarnos una idea distinta para evaluarla en conjunto.",
  },
  {
    question: "¿Cómo se cotiza un local comercial?",
    answer:
      "Primero cuéntanos tu concepto y necesidades. Te contactaremos por WhatsApp para agendar una visita, revisar el espacio disponible y preparar una propuesta acorde al proyecto.",
  },
  {
    question: "¿Puedo conocer los espacios antes de decidir?",
    answer:
      "Sí. La visita es el paso central del proceso: recorremos los espacios disponibles, conversamos sobre tu idea y resolvemos las dudas antes de preparar una propuesta.",
  },
  {
    question: "¿Dónde está Casona San Martín?",
    answer:
      "Estamos en Carretera San Martín 421, Paradero 10, Rinconada de los Andes, en el Valle de Aconcagua. El recinto cuenta con estacionamiento dentro del predio.",
  },
];

export default function LeaseFAQ() {
  return (
    <section className="bg-black px-4 pb-14 sm:px-6 sm:pb-20">
      <div className="mx-auto max-w-5xl border-t border-white/10 pt-12 sm:pt-16">
        <motion.div
          className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#D4A574]">
              Antes de conversar
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-[#E1E0CC] sm:text-4xl">
              Preguntas sobre el <span className="italic">arriendo</span>.
            </h2>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {QUESTIONS.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-lg text-[#E1E0CC] marker:hidden">
                  {question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#D4A574] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pr-12 pt-4 text-sm leading-relaxed text-gray-400">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
