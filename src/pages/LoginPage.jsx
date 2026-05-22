import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Leaf, Lock, Mail } from "lucide-react";

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
      <Link to="/login" className="auth-brand">
        <Leaf size={22} fill="currentColor" />
        <span>PlantCare</span>
      </Link>

      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to your botanical dashboard
        </p>

        <form className="form auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email Address</span>
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
            <span>Password</span>
            <span className="input-shell">
              <Lock size={20} />
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <Eye size={20} />
            </span>
          </label>

          {error && <div className="error">{error}</div>}

          <button className="button auth-submit" type="submit" disabled={loading}>
            <span>{loading ? "Signing In..." : "Sign In"}</span>
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="auth-footer">
          New to PlantCare? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
