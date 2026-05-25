import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Leaf, Lock, Mail, User } from "lucide-react";

import LanguageToggle from "../components/LanguageToggle";
import { registerUser } from "../api/authApi";
import { useLanguage } from "../i18n/LanguageContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    email: "",
    username: "",
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

    console.log("REGISTER FORM SUBMIT:", form);

    setError("");
    setLoading(true);

    try {
      const data = await registerUser(form);

      console.log("REGISTER SUCCESS:", data);

      navigate("/login");
    } catch (error) {
      console.log("REGISTER ERROR:", error);
      console.log("REGISTER RESPONSE:", error.response?.data);

      const detail = error.response?.data?.detail;

      let message = "Не удалось зарегистрироваться";

      if (typeof detail === "string") {
        message = detail;
      }

      if (Array.isArray(detail)) {
        message = detail.map((item) => item.msg).join(", ");
      }

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

      <div className="auth-card auth-card-register">
        <h1 className="auth-title">{t("registerTitle")}</h1>

        <p className="auth-subtitle">
          {t("registerSubtitle")}
        </p>

        <form className="form auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t("username")}</span>
            <span className="input-shell">
              <User size={20} />
              <input
                className="input"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={t("usernamePlaceholder")}
                required
                minLength={2}
                maxLength={100}
              />
            </span>
          </label>

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
                placeholder={t("passwordMinPlaceholder")}
                required
                minLength={6}
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
            <span>
              {loading ? t("registerLoading") : t("registerSubmit")}
            </span>
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="auth-footer">
          {t("registerFooter")}{" "}
          <Link to="/login">{t("registerFooterLink")}</Link>
        </p>
      </div>
    </div>
  );
}
