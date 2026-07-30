import { useLanguage } from "../hooks/useLanguage.js";
import "./LanguageSwitcher.css";

const LANGUAGES = ["es", "en", "pt"];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher" role="group" aria-label="Idioma">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          className={`language-switcher__option${lang === language ? " is-active" : ""}`}
          onClick={() => setLanguage(lang)}
          aria-pressed={lang === language}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
