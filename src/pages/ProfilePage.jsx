import { useEffect, useState } from "react";
import { BriefcaseBusiness, Pencil } from "lucide-react";

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
            <>
              <section className="profile-hero">
                <div className="avatar-box">
                  <form className="avatar-form" onSubmit={handleAvatarSubmit}>
                    <div className="avatar-upload">
                      {user.avatar_url ? (
                        <img
                          className="avatar-image"
                          src={getMediaUrl(user.avatar_url)}
                          alt="Аватар профиля"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <input
                        id="avatar-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) =>
                          setAvatarFile(event.target.files?.[0] || null)
                        }
                      />
                      <label
                        htmlFor="avatar-file"
                        className="avatar-edit"
                        aria-label="Выбрать аватар"
                      >
                        <Pencil size={18} />
                      </label>
                    </div>

                    {avatarFile && (
                      <button
                        className="button avatar-submit"
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? "Загрузка..." : "Загрузить аватар"}
                      </button>
                    )}
                  </form>
                </div>

                <div className="profile-heading">
                  <h2>{user.username}</h2>
                  <p>{user.email}</p>
                </div>
              </section>

              <div className="profile-grid">
                <div className="card profile-panel">
                  <h2>
                    <BriefcaseBusiness size={22} />
                    <span>Личная информация</span>
                  </h2>

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

                    <button className="button full" type="submit" disabled={saving}>
                      {saving ? "Сохранение..." : "Сохранить изменения"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="profile-messages">
                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
