declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean>;

/**
 * Envía eventos solamente cuando la persona aceptó Analytics.
 * Nunca incluir nombre, teléfono, mensajes u otros datos personales.
 */
export function trackEvent(name: string, params: EventParams = {}) {
  try {
    if (localStorage.getItem("cookie_consent") !== "granted") return;
    window.gtag?.("event", name, params);
  } catch {
    // Analytics nunca debe bloquear una conversión o la navegación.
  }
}
