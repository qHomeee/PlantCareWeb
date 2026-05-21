import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
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
      <div className="card auth-card">
        <h1 className="auth-title">Вход</h1>
        <p className="auth-subtitle">
          Войдите в аккаунт, чтобы управлять своими растениями.
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
            Пароль
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              required
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="auth-footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}