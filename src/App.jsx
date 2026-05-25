import AppRouter from "./router/AppRouter";
import { LanguageProvider } from "./i18n/LanguageContext";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/auth.css";
import "./styles/profile.css";
import "./styles/recognize.css";
import "./styles/confirm.css";
import "./styles/gallery.css";
import "./styles/care.css";

export default function App() {
  return (
    <LanguageProvider>
      <AppRouter />
    </LanguageProvider>
  );
}
