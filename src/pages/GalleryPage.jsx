import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Leaf } from "lucide-react";

import Layout from "../components/Layout";
import { getGallery } from "../api/galleryApi";
import { getMediaUrl } from "../utils/media";

export default function GalleryPage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGallery() {
    setLoading(true);
    setError("");

    try {
      const data = await getGallery();
      setPlants(data);
    } catch (error) {
      console.log("GET GALLERY ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Не удалось загрузить галерею"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, []);

  return (
    <Layout>
      <div className="page">
        <div className="gallery-container">
          <div className="page-header gallery-header">
            <div>
              <h1 className="page-title">Галерея</h1>
              <p className="page-subtitle">
                Ваша персональная коллекция растений.
              </p>
            </div>

            <Link to="/recognize" className="button gallery-add-button">
              <ImagePlus size={20} />
              <span>Добавить растение</span>
            </Link>
          </div>

          {loading && <div className="card">Загрузка галереи...</div>}

          {error && <div className="card error">{error}</div>}

          {!loading && !error && plants.length === 0 && (
            <div className="card empty-state">
              <div className="empty-icon">
                <Leaf size={42} />
              </div>

              <h2>В галерее пока нет растений</h2>

              <p className="muted">
                Распознайте первое растение и добавьте его в свою коллекцию.
              </p>

              <Link to="/recognize" className="button">
                Распознать растение
              </Link>
            </div>
          )}

          {!loading && !error && plants.length > 0 && (
            <div className="gallery-grid">
              {plants.map((item) => {
                const title =
                  item.custom_name || item.plant?.common_name || "Растение";

                const subtitle = item.plant?.scientific_name || "";

                return (
                  <Link
                    key={item.id}
                    to={`/gallery/${item.id}`}
                    className="card gallery-card"
                  >
                    {item.image_url ? (
                      <img
                        className="gallery-image"
                        src={getMediaUrl(item.image_url)}
                        alt={title}
                      />
                    ) : (
                      <div className="gallery-image-placeholder">
                        <Leaf size={40} />
                      </div>
                    )}

                    <h2 className="gallery-card-title">{title}</h2>
                    <p className="gallery-card-subtitle">{subtitle}</p>

                    <div className="gallery-meta">
                      <span>
                        Полив: каждые {item.plant?.watering_interval_days} дн.
                      </span>

                      {item.next_watering_date && (
                        <span>Следующий: {item.next_watering_date}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}