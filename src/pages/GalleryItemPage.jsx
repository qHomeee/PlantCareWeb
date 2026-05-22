import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Droplets, Trash2 } from "lucide-react";

import Layout from "../components/Layout";
import {
  deleteGalleryItem,
  getGalleryItem,
  updateGalleryItem,
} from "../api/galleryApi";
import { getPlantWateringEvents } from "../api/careApi";
import { getMediaUrl } from "../utils/media";

export default function GalleryItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [wateringEvents, setWateringEvents] = useState([]);

  const [customName, setCustomName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const galleryItem = await getGalleryItem(id);
      setItem(galleryItem);
      setCustomName(galleryItem.custom_name || "");

      const events = await getPlantWateringEvents(id);
      setWateringEvents(events);
    } catch (error) {
      console.log("GET GALLERY ITEM ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Не удалось загрузить растение"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleUpdate(event) {
    event.preventDefault();

    if (!item) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedItem = await updateGalleryItem(id, {
        custom_name: customName,
        image_url: item.image_url || null,
      });

      setItem(updatedItem);
      setMessage("Название растения обновлено");
    } catch (error) {
      console.log("UPDATE GALLERY ITEM ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Не удалось обновить растение"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const isConfirmed = window.confirm(
      "Удалить растение из галереи? Это действие нельзя отменить."
    );

    if (!isConfirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteGalleryItem(id);
      navigate("/gallery");
    } catch (error) {
      console.log("DELETE GALLERY ITEM ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Не удалось удалить растение"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="page">
          <div className="container">
            <div className="card">Загрузка растения...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !item) {
    return (
      <Layout>
        <div className="page">
          <div className="container">
            <Link to="/gallery" className="back-link">
              <ArrowLeft size={18} />
              <span>Назад в галерею</span>
            </Link>

            <div className="card error">{error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  const plant = item.plant;
  const title = item.custom_name || plant.common_name;

  return (
    <Layout>
      <div className="page">
        <div className="container">
          <Link to="/gallery" className="back-link">
            <ArrowLeft size={18} />
            <span>Назад в галерею</span>
          </Link>

          <div className="plant-detail-grid">
            <div className="card">
              {item.image_url ? (
                <img
                  className="plant-detail-image"
                  src={getMediaUrl(item.image_url)}
                  alt={title}
                />
              ) : (
                <div className="plant-detail-image-placeholder">
                  Нет изображения
                </div>
              )}

              <h1 className="plant-detail-title">{title}</h1>
              <p className="muted">{plant.scientific_name}</p>

              <form className="form" onSubmit={handleUpdate}>
                <label>
                  Название в галерее
                  <input
                    className="input"
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    maxLength={255}
                  />
                </label>

                <button className="button" type="submit" disabled={saving}>
                  {saving ? "Сохранение..." : "Сохранить название"}
                </button>
              </form>

              <button
                className="danger-button"
                type="button"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 size={18} />
                <span>Удалить из галереи</span>
              </button>

              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}
            </div>

            <div className="plant-detail-content">
              <div className="card">
                <h2>Рекомендации по уходу</h2>

                <div className="detail-list">
                  <div>
                    <strong>Описание:</strong>
                    <p>{plant.description}</p>
                  </div>

                  <div>
                    <strong>Полив:</strong>
                    <p>
                      {plant.watering_info} Интервал: каждые{" "}
                      {plant.watering_interval_days} дн.
                    </p>
                  </div>

                  <div>
                    <strong>Освещение:</strong>
                    <p>{plant.light_info}</p>
                  </div>

                  <div>
                    <strong>Температура:</strong>
                    <p>
                      {plant.min_temperature_celsius}–
                      {plant.max_temperature_celsius} °C
                    </p>
                  </div>

                  <div>
                    <strong>Влажность:</strong>
                    <p>{plant.humidity_info}</p>
                  </div>

                  <div>
                    <strong>Грунт:</strong>
                    <p>{plant.soil_info}</p>
                  </div>

                  <div>
                    <strong>Удобрение:</strong>
                    <p>
                      {plant.fertilizing_info} Интервал: каждые{" "}
                      {plant.fertilizing_interval_days} дн.
                    </p>
                  </div>

                  <div>
                    <strong>Общий уход:</strong>
                    <p>{plant.care_info}</p>
                  </div>

                  <div>
                    <strong>Полезная информация:</strong>
                    <p>{plant.useful_info}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2>Полив</h2>

                <div className="watering-summary">
                  <div>
                    <span className="muted">Последний полив</span>
                    <strong>{item.last_watered_at || "Не отмечался"}</strong>
                  </div>

                  <div>
                    <span className="muted">Следующий полив</span>
                    <strong>{item.next_watering_date || "Не запланирован"}</strong>
                  </div>
                </div>

                <div className="plant-events">
                  {wateringEvents.length === 0 && (
                    <p className="muted">События полива не найдены.</p>
                  )}

                  {wateringEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="plant-event-row">
                      <Droplets size={18} />
                      <div>
                        <strong>{event.scheduled_date}</strong>
                        <p className="muted">
                          {event.status}
                          {event.note ? ` — ${event.note}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/care" className="button secondary">
                  Все события полива
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}