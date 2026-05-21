import { useEffect, useState } from "react";

import Layout from "../components/Layout";
import { getMe, updateMe, uploadAvatar } from "../api/usersApi";
import { getMediaUrl } from "../utils/media";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadUser() {
    setLoading(true);
    setError("");

    try {
      const data = await getMe();
      setUser(data);
      setUsername(data.username);
    } catch (error) {
      console.log("GET ME ERROR:", error);
      setError("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function handleProfileSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedUser = await updateMe({
        username,
      });

      setUser(updatedUser);
      setMessage("Профиль обновлен");
    } catch (error) {
      console.log("UPDATE PROFILE ERROR:", error);
      setError("Не удалось обновить профиль");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarSubmit(event) {
    event.preventDefault();

    if (!avatarFile) {
      setError("Выберите файл аватара");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedUser = await uploadAvatar(avatarFile);

      setUser(updatedUser);
      setAvatarFile(null);
      setMessage("Аватар обновлен");
    } catch (error) {
      console.log("UPLOAD AVATAR ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Не удалось загрузить аватар");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Профиль</h1>
            <p className="page-subtitle">
              Управление личными данными пользователя.
            </p>
          </div>

          {loading && <div className="card">Загрузка профиля...</div>}

          {!loading && user && (
            <div className="profile-grid">
              <div className="card profile-card">
                <div className="avatar-box">
                  {user.avatar_url ? (
                    <img
                      className="avatar-image"
                      src={getMediaUrl(user.avatar_url)}
                      alt="Аватар пользователя"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                <h2>{user.username}</h2>
                <p className="muted">{user.email}</p>
              </div>

              <div className="card">
                <h2>Данные профиля</h2>

                <form className="form" onSubmit={handleProfileSubmit}>
                  <label>
                    Имя пользователя
                    <input
                      className="input"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      minLength={2}
                      maxLength={100}
                      required
                    />
                  </label>

                  <button className="button" type="submit" disabled={saving}>
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                </form>

                <hr className="divider" />

                <h2>Аватар</h2>

                <form className="form" onSubmit={handleAvatarSubmit}>
                  <label>
                    Фото профиля
                    <input
                      className="input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        setAvatarFile(event.target.files?.[0] || null)
                      }
                    />
                  </label>

                  <button className="button secondary" type="submit" disabled={saving}>
                    {saving ? "Загрузка..." : "Загрузить аватар"}
                  </button>
                </form>

                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}