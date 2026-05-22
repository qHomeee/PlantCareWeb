import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Droplet,
  Grid3X3,
  ImagePlus,
  Leaf,
  List,
  Search,
  SlidersHorizontal,
  Sprout,
  Sun,
} from "lucide-react";

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
            <h1 className="page-title">Мои растения</h1>
          </div>

          <div className="gallery-toolbar">
            <label className="gallery-search">
              <Search size={20} />
              <input type="search" placeholder="Поиск по коллекции..." />
            </label>

            <button className="gallery-filter" type="button">
              <SlidersHorizontal size={18} />
              <span>Фильтр</span>
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <span>Всего растений</span>
                <strong>{plants.length}</strong>
              </div>
              <Sprout size={24} />
            </div>

            <div className="stat-card stat-card-alert">
              <div>
                <span>Нужен полив</span>
                <strong>
                  {
                    plants.filter((item) => Boolean(item.next_watering_date))
                      .length
                  }
                </strong>
              </div>
              <Droplet size={24} />
            </div>
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
            <>
              <div className="collection-heading">
                <h2>Ваша коллекция</h2>

                <div className="view-toggle">
                  <button type="button">
                    <Grid3X3 size={20} />
                  </button>
                  <button type="button">
                    <List size={20} />
                  </button>
                </div>
              </div>

              <div className="gallery-grid">
                {plants.map((item) => {
                  const title =
                    item.custom_name || item.plant?.common_name || "Растение";

                  const subtitle = item.plant?.scientific_name || "";

                  return (
                    <Link
                      key={item.id}
                      to={`/gallery/${item.id}`}
                      className="gallery-card"
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

                      <div className="gallery-card-body">
                        <h3 className="gallery-card-title">{title}</h3>
                        <p className="gallery-card-subtitle">{subtitle}</p>

                        <div className="gallery-meta">
                          <span className={item.next_watering_date ? "meta-alert" : ""}>
                            {item.next_watering_date ? (
                              <AlertTriangle size={16} />
                            ) : (
                              <Droplet size={16} />
                            )}
                            {item.next_watering_date
                              ? "Нужен полив"
                              : `Полив через ${item.plant?.watering_interval_days || 0} дн.`}
                          </span>

                          <span>
                            <Sun size={16} />
                            {item.plant?.light_info || "Средний свет"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          <Link to="/recognize" className="fab" aria-label="Добавить растение">
            <ImagePlus size={26} />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
