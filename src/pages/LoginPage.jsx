import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Leaf, Lock, Mail } from "lucide-react";

import LanguageToggle from "../components/LanguageToggle";
import { loginUser } from "../api/authApi";
import { useLanguage } from "../i18n/LanguageContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form);

      localStorage.setItem("access_token", data.access_token);

      navigate("/gallery");
    } catch (error) {
      const message =
        error.response?.data?.detail || "Не удалось выполнить вход";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Link to="/login" className="auth-brand">
        <Leaf size={22} fill="currentColor" />
        <span>PlantCare</span>
      </Link>
      <LanguageToggle className="auth-language-toggle" />

      <div className="auth-card">
        <h1 className="auth-title">{t("loginTitle")}</h1>
        <p className="auth-subtitle">
          {t("loginSubtitle")}
        </p>

        <form className="form auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t("email")}</span>
            <span className="input-shell">
              <Mail size={20} />
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="hello@plantcare.com"
                required
              />
            </span>
          </label>

          <label className="field">
            <span>{t("password")}</span>
            <span className="input-shell">
              <Lock size={20} />
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t("passwordPlaceholder")}
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </span>
          </label>

          {error && <div className="error">{error}</div>}

          <button className="button auth-submit" type="submit" disabled={loading}>
            <span>{loading ? t("loginLoading") : t("loginSubmit")}</span>
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="auth-footer">
          {t("loginFooter")} <Link to="/register">{t("loginFooterLink")}</Link>
        </p>
      </div>
    </div>
  );
}
