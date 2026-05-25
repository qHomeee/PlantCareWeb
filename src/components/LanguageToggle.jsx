import { Languages } from "lucide-react";

import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageToggle({ className = "" }) {
  const { language, t, toggleLanguage } = useLanguage();

  return (
    <button
      className={`language-toggle ${className}`.trim()}
      type="button"
      onClick={toggleLanguage}
      aria-label={t("languageToggle")}
      title={t("languageToggle")}
    >
      <Languages size={17} />
      <span>{language === "ru" ? "EN" : "RU"}</span>
    </button>
  );
}
