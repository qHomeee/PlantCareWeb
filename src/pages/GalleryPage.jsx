import { useEffect, useMemo, useState } from "react";
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
import { useLanguage } from "../i18n/LanguageContext";
import { getMediaUrl } from "../utils/media";

const FILTER_KEYS = {
  all: "filterAll",
  needsWater: "filterNeedsWater",
  ok: "filterOk",
};

function isWateringDue(item) {
  if (!item.next_watering_date) {
    return false;
  }

  const nextWatering = new Date(`${item.next_watering_date}T00:00:00`);

  if (Number.isNaN(nextWatering.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return nextWatering <= today;
}

function getWateringLabel(item, t, dateLocale) {
  if (isWateringDue(item)) {
    return t("wateringDue");
  }

  if (item.next_watering_date) {
    return t("nextWatering", {
      date: new Date(
      `${item.next_watering_date}T00:00:00`
      ).toLocaleDateString(dateLocale),
    });
  }

  return t("wateringInterval", {
    days: item.plant?.watering_interval_days || 0,
  });
}

export default function GalleryPage() {
  const { dateLocale, t } = useLanguage();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

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
          : t("loadGalleryFailed")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, []);

  const wateringCount = useMemo(
    () => plants.filter((item) => isWateringDue(item)).length,
    [plants]
  );

  const filteredPlants = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return plants.filter((item) => {
      const title = item.custom_name || item.plant?.common_name || "";
      const values = [
        title,
        item.plant?.common_name,
        item.plant?.scientific_name,
        item.plant?.light_info,
        item.plant?.watering_info,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedQuery.length === 0 || values.includes(normalizedQuery);

      const needsWater = isWateringDue(item);
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "needsWater" && needsWater) ||
        (filterMode === "ok" && !needsWater);

      return matchesSearch && matchesFilter;
    });
  }, [filterMode, plants, searchQuery]);

  return (
    <Layout>
      <div className="page">
        <div className="gallery-container">
          <div className="page-header gallery-header">
            <h1 className="page-title">{t("galleryTitle")}</h1>
          </div>

          <div className="gallery-toolbar">
            <label className="gallery-search">
              <Search size={20} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
              />
            </label>

            <div className="gallery-filter-wrap">
              <button
                className="gallery-filter"
                type="button"
                onClick={() => setIsFilterOpen((value) => !value)}
                aria-expanded={isFilterOpen}
              >
                <SlidersHorizontal size={18} />
                <span>{t(FILTER_KEYS[filterMode])}</span>
              </button>

              {isFilterOpen && (
                <div className="filter-menu">
                  {Object.entries(FILTER_KEYS).map(([value, labelKey]) => (
                    <button
                      key={value}
                      className={filterMode === value ? "active" : ""}
                      type="button"
                      onClick={() => {
                        setFilterMode(value);
                        setIsFilterOpen(false);
                      }}
                    >
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <span>{t("totalPlants")}</span>
                <strong>{plants.length}</strong>
              </div>
              <Sprout size={24} />
            </div>

            <div className="stat-card stat-card-alert">
              <div>
                <span>{t("needsWater")}</span>
                <strong>
                  {wateringCount}
                </strong>
              </div>
              <Droplet size={24} />
            </div>
          </div>

          {loading && <div className="card">{t("loadingGallery")}</div>}

          {error && <div className="card error">{error}</div>}

          {!loading && !error && plants.length === 0 && (
            <div className="card empty-state">
              <div className="empty-icon">
                <Leaf size={42} />
              </div>

              <h2>{t("emptyGalleryTitle")}</h2>

              <p className="muted">
                {t("emptyGalleryText")}
              </p>

              <Link to="/recognize" className="button">
                {t("recognizePlant")}
              </Link>
            </div>
          )}

          {!loading && !error && plants.length > 0 && (
            <>
              <div className="collection-heading">
                <h2>{t("collectionTitle")}</h2>

                <div className="view-toggle">
                  <button
                    className={viewMode === "grid" ? "active" : ""}
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label={t("gridView")}
                  >
                    <Grid3X3 size={20} />
                  </button>
                  <button
                    className={viewMode === "list" ? "active" : ""}
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label={t("listView")}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              {filteredPlants.length === 0 && (
                <div className="card empty-state">
                  <div className="empty-icon">
                    <Search size={42} />
                  </div>
                  <h2>{t("noResultsTitle")}</h2>
                  <p className="muted">
                    {t("noResultsText")}
                  </p>
                </div>
              )}

              {filteredPlants.length > 0 && (
                <div className={`gallery-grid gallery-grid-${viewMode}`}>
                  {filteredPlants.map((item) => {
                    const title =
                      item.custom_name ||
                      item.plant?.common_name ||
                      t("plantFallback");

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
                            <span className={isWateringDue(item) ? "meta-alert" : ""}>
                              {isWateringDue(item) ? (
                                <AlertTriangle size={16} />
                              ) : (
                                <Droplet size={16} />
                              )}
                              {getWateringLabel(item, t, dateLocale)}
                            </span>

                            <span>
                              <Sun size={16} />
                              {item.plant?.light_info || t("mediumLight")}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <Link to="/recognize" className="fab" aria-label={t("addPlant")}>
            <ImagePlus size={26} />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
