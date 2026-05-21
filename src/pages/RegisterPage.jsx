import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
      <div className="card auth-card">
        <h1 className="auth-title">Регистрация</h1>

        <p className="auth-subtitle">
          Создайте аккаунт для хранения своей коллекции растений.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
            />
          </label>

          <label>
            Имя пользователя
            <input
              className="input"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Введите имя"
              required
              minLength={2}
              maxLength={100}
            />
          </label>

          <label>
            Пароль
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
          </label>

          {error && <div className="error">{error}</div>}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}