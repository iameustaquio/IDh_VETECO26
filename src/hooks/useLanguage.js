import { useMemo } from "react";
import { useStore } from "../state/store.js";
import es from "../content/i18n/es.json";
import en from "../content/i18n/en.json";
import pt from "../content/i18n/pt.json";

const dictionaries = { es, en, pt };

// Añadir un cuarto idioma es una clave más aquí — nunca tocar los componentes
// (documento 05, sección 10).
export function useLanguage() {
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const t = useMemo(() => dictionaries[language], [language]);
  return { language, setLanguage, t };
}
