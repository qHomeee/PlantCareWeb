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
import { useLanguage } from "../i18n/LanguageContext";
import { getMediaUrl } from "../utils/media";

export default function GalleryItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          : t("loadPlantFailed")
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
      setMessage(t("plantNameUpdated"));
    } catch (error) {
      console.log("UPDATE GALLERY ITEM ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : t("updatePlantFailed")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const isConfirmed = window.confirm(
      t("deleteConfirm")
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
          : t("deletePlantFailed")
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
            <div className="card">{t("loadingPlant")}</div>
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
              <span>{t("backToGallery")}</span>
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
            <span>{t("backToGallery")}</span>
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
                  {t("noImage")}
                </div>
              )}

              <h1 className="plant-detail-title">{title}</h1>
              <p className="muted">{plant.scientific_name}</p>

              <form className="form" onSubmit={handleUpdate}>
                <label>
                  {t("galleryPlantName")}
                  <input
                    className="input"
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    maxLength={255}
                  />
                </label>

                <button className="button" type="submit" disabled={saving}>
                  {saving ? t("savingName") : t("saveName")}
                </button>
              </form>

              <button
                className="danger-button"
                type="button"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 size={18} />
                <span>{t("deleteFromGallery")}</span>
              </button>

              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}
            </div>

            <div className="plant-detail-content">
              <div className="card">
                <h2>{t("careRecommendations")}</h2>

                <div className="detail-list">
                  <div>
                    <strong>{t("description")}</strong>
                    <p>{plant.description}</p>
                  </div>

                  <div>
                    <strong>{t("watering")}</strong>
                    <p>
                      {plant.watering_info} {t("interval")}{" "}
                      {t("everyDays", { days: plant.watering_interval_days })}
                    </p>
                  </div>

                  <div>
                    <strong>{t("lighting")}</strong>
                    <p>{plant.light_info}</p>
                  </div>

                  <div>
                    <strong>{t("temperature")}</strong>
                    <p>
                      {plant.min_temperature_celsius}–
                      {plant.max_temperature_celsius} °C
                    </p>
                  </div>

                  <div>
                    <strong>{t("humidity")}</strong>
                    <p>{plant.humidity_info}</p>
                  </div>

                  <div>
                    <strong>{t("soil")}</strong>
                    <p>{plant.soil_info}</p>
                  </div>

                  <div>
                    <strong>{t("fertilizer")}</strong>
                    <p>
                      {plant.fertilizing_info} {t("interval")}{" "}
                      {t("everyDays", {
                        days: plant.fertilizing_interval_days,
                      })}
                    </p>
                  </div>

                  <div>
                    <strong>{t("generalCare")}</strong>
                    <p>{plant.care_info}</p>
                  </div>

                  <div>
                    <strong>{t("usefulInfo")}</strong>
                    <p>{plant.useful_info}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2>{t("wateringTitle")}</h2>

                <div className="watering-summary">
                  <div>
                    <span className="muted">{t("lastWatering")}</span>
                    <strong>{item.last_watered_at || t("notMarked")}</strong>
                  </div>

                  <div>
                    <span className="muted">{t("nextWateringPlain")}</span>
                    <strong>{item.next_watering_date || t("notPlanned")}</strong>
                  </div>
                </div>

                <div className="plant-events">
                  {wateringEvents.length === 0 && (
                    <p className="muted">{t("wateringEventsNotFound")}</p>
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
                  {t("allWateringEvents")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
