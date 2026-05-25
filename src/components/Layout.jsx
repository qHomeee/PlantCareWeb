import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Sprout, User } from "lucide-react";

import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../i18n/LanguageContext";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/gallery" className="logo">
          <Leaf size={26} fill="currentColor" />
          <span>PlantCare</span>
        </Link>

        <nav className="nav">
          <NavLink to="/gallery" className="nav-link">
            <Sprout size={20} />
            <span>{t("navPlants")}</span>
          </NavLink>

          <NavLink to="/profile" className="nav-link">
            <User size={20} />
            <span>{t("navProfile")}</span>
          </NavLink>
        </nav>

        <LanguageToggle className="sidebar-language-toggle" />

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>{t("logout")}</span>
        </button>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
