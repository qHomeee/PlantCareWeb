import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Leaf, Lock, Mail, User } from "lucide-react";

import { registerUser } from "../api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      <div className="auth-card auth-card-register">
        <h1 className="auth-title">Создать аккаунт</h1>

        <p className="auth-subtitle">
          Присоединяйтесь к сообществу любителей растений
        </p>

        <form className="form auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Имя пользователя</span>
            <span className="input-shell">
              <User size={20} />
              <input
                className="input"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Анна"
                required
                minLength={2}
                maxLength={100}
              />
            </span>
          </label>

          <label className="field">
            <span>Email</span>
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
            <span>Пароль</span>
            <span className="input-shell">
              <Lock size={20} />
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
              />
              <Eye size={20} />
            </span>
          </label>

          {error && <div className="error">{error}</div>}

          <button className="button auth-submit" type="submit" disabled={loading}>
            <span>{loading ? "Регистрация..." : "Зарегистрироваться"}</span>
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
