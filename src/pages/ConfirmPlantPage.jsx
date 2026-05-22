import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import { addToGallery } from "../api/galleryApi";
import { getMediaUrl } from "../utils/media";

export default function ConfirmPlantPage() {
  const navigate = useNavigate();

  const [plant, setPlant] = useState(null);
  const [customName, setCustomName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rawData = sessionStorage.getItem("recognized_plant");

    if (!rawData) {
      navigate("/recognize");
      return;
    }

    try {
      const parsedPlant = JSON.parse(rawData);

      setPlant(parsedPlant);
      setCustomName(parsedPlant.common_name || "");
    } catch (error) {
      console.log("PARSE RECOGNIZED PLANT ERROR:", error);
      sessionStorage.removeItem("recognized_plant");
      navigate("/recognize");
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!plant) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addToGallery({
        plant_id: plant.plant_id,
        custom_name: customName || plant.common_name,
        image_url: plant.image_url || null,
      });

      sessionStorage.removeItem("recognized_plant");
      navigate("/gallery");
    } catch (error) {
      console.log("ADD TO GALLERY ERROR:", error);

      const detail = error.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Не удалось добавить растение в галерею"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!plant) {
    return (
      <Layout>
        <div className="page">
          <div className="confirm-container">
            <div className="card">Загрузка результата распознавания...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <div className="confirm-container">
          <div className="page-header">
            <h1 className="page-title">Подтверждение растения</h1>
            <p className="page-subtitle">
              Проверьте результат распознавания и добавьте растение в галерею.
            </p>
          </div>

          <div className="confirm-grid">
            <div className="card">
              {plant.image_url && (
                <img
                  className="confirm-image"
                  src={getMediaUrl(plant.image_url)}
                  alt={plant.common_name}
                />
              )}

              <h2 className="confirm-plant-title">{plant.common_name}</h2>
              <p className="muted">{plant.scientific_name}</p>

              <p>{plant.description}</p>

              <div className="info-list">
                <div>
                  <strong>Уверенность:</strong>{" "}
                  {Math.round(plant.confidence * 100)}%
                </div>

                <div>
                  <strong>Температура:</strong>{" "}
                  {plant.min_temperature_celsius}–
                  {plant.max_temperature_celsius} °C
                </div>

                <div>
                  <strong>Полив:</strong> каждые{" "}
                  {plant.watering_interval_days} дн.
                </div>

                <div>
                  <strong>Удобрение:</strong> каждые{" "}
                  {plant.fertilizing_interval_days} дн.
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Добавление в галерею</h2>

              <form className="form" onSubmit={handleSubmit}>
                <label>
                  Название в вашей галерее
                  <input
                    className="input"
                    type="text"
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    placeholder="Например: Монстера у окна"
                    maxLength={255}
                  />
                </label>

                {error && <div className="error">{error}</div>}

                <button className="button full" type="submit" disabled={loading}>
                  {loading ? "Добавление..." : "Добавить в галерею"}
                </button>

                <button
                  className="button secondary full"
                  type="button"
                  onClick={() => navigate("/recognize")}
                  disabled={loading}
                >
                  Распознать другое фото
                </button>
              </form>

              <div className="care-preview">
                <h3>Краткие рекомендации</h3>

                <p>
                  <strong>Свет:</strong> {plant.light_info}
                </p>

                <p>
                  <strong>Влажность:</strong> {plant.humidity_info}
                </p>

                <p>
                  <strong>Грунт:</strong> {plant.soil_info}
                </p>

                <p>
                  <strong>Уход:</strong> {plant.care_info}
                </p>

                <p>
                  <strong>Полезно:</strong> {plant.useful_info}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}