import { useEffect, useMemo, useState } from "react";
import { Check, Droplets, SkipForward } from "lucide-react";

import Layout from "../components/Layout";
import {
  completeWateringEvent,
  getWateringEvents,
  skipWateringEvent,
} from "../api/careApi";
import { getGallery } from "../api/galleryApi";
import { useLanguage } from "../i18n/LanguageContext";

const STATUS_LABEL_KEYS = {
  planned: "statusPlanned",
  completed: "statusCompleted",
  skipped: "statusSkipped",
};

function formatDate(value, locale, fallback) {
  if (!value) {
    return fallback;
  }

  return new Date(value).toLocaleDateString(locale);
}

function formatDateTime(value, locale, fallback) {
  if (!value) {
    return fallback;
  }

  return new Date(value).toLocaleString(locale);
}

export default function CarePage() {
  const { dateLocale, t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);

  const [statusFilter, setStatusFilter] = useState("planned");
  const [plantFilter, setPlantFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [error, setError] = useState("");

  const plantsByUserPlantId = useMemo(() => {
    const map = {};

    galleryItems.forEach((item) => {
      map[item.id] = item;
    });

    return map;
  }, [galleryItems]);

  const filteredEvents = useMemo(() => {
    if (!plantFilter) {
      return events;
    }

    return events.filter(
      (event) => String(event.user_plant_id) === String(plantFilter)
    );
  }, [events, plantFilter]);

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      const [eventsData, galleryData] = await Promise.all([
        getWateringEvents(statusFilter || null),
        getGallery(),
      ]);

      setEvents(eventsData);
      setGalleryItems(galleryData);
    } catch (error) {
      console.log("GET WATERING EVENTS ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : t("loadWateringEventsFailed")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [statusFilter]);

  async function handleComplete(eventId) {
    setActionLoadingId(eventId);
    setError("");

    try {
      await completeWateringEvent(eventId, t("completeWateringNote"));
      await loadEvents();
    } catch (error) {
      console.log("COMPLETE WATERING ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : t("completeWateringFailed")
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSkip(eventId) {
    setActionLoadingId(eventId);
    setError("");

    try {
      await skipWateringEvent(eventId, t("skipWateringNote"));
      await loadEvents();
    } catch (error) {
      console.log("SKIP WATERING ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : t("skipWateringFailed")
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <Layout>
      <div className="page">
        <div className="care-container">
          <div className="page-header care-header">
            <div>
              <h1 className="page-title">{t("careTitle")}</h1>
              <p className="page-subtitle">
                {t("careSubtitle")}
              </p>
            </div>

            <div className="care-filters">
              <select
                className="input care-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">{t("allEvents")}</option>
                <option value="planned">{t("plannedEvents")}</option>
                <option value="completed">{t("completedEvents")}</option>
                <option value="skipped">{t("skippedEvents")}</option>
              </select>

              <select
                className="input care-filter"
                value={plantFilter}
                onChange={(event) => setPlantFilter(event.target.value)}
              >
                <option value="">{t("allPlants")}</option>

                {galleryItems.map((item) => {
                  const plantName =
                    item.custom_name ||
                    item.plant?.common_name ||
                    `${t("plantFallback")} #${item.id}`;

                  return (
                    <option key={item.id} value={item.id}>
                      {plantName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {loading && <div className="card">{t("loadingWateringEvents")}</div>}

          {error && <div className="card error">{error}</div>}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="card care-empty">
              <div className="care-empty-icon">
                <Droplets size={42} />
              </div>

              <h2>{t("wateringEventsEmptyTitle")}</h2>

              <p className="muted">
                {t("wateringEventsEmptyText")}
              </p>
            </div>
          )}

          {!loading && !error && filteredEvents.length > 0 && (
            <div className="care-list">
              {filteredEvents.map((event) => {
                const isPlanned = event.status === "planned";
                const isActionLoading = actionLoadingId === event.id;

                const userPlant = plantsByUserPlantId[event.user_plant_id];

                const plantName =
                  userPlant?.custom_name ||
                  userPlant?.plant?.common_name ||
                  `${t("plantFallback")} #${event.user_plant_id}`;

                const scientificName = userPlant?.plant?.scientific_name;

                return (
                  <div key={event.id} className="card care-event">
                    <div className="care-event-main">
                      <div className={`care-status care-status-${event.status}`}>
                        {STATUS_LABEL_KEYS[event.status]
                          ? t(STATUS_LABEL_KEYS[event.status])
                          : event.status}
                      </div>

                      <h2 className="care-event-title">{plantName}</h2>

                      {scientificName && (
                        <p className="care-event-subtitle">{scientificName}</p>
                      )}

                      <div className="care-event-info">
                        <div>
                          <strong>{t("wateringDate")}</strong>{" "}
                          {formatDate(event.scheduled_date, dateLocale, t("dash"))}
                        </div>

                        {event.completed_at && (
                          <div>
                            <strong>{t("completedAt")}</strong>{" "}
                            {formatDateTime(event.completed_at, dateLocale, t("dash"))}
                          </div>
                        )}

                        {event.note && (
                          <div>
                            <strong>{t("note")}</strong> {event.note}
                          </div>
                        )}
                      </div>
                    </div>

                    {isPlanned && (
                      <div className="care-event-actions">
                        <button
                          className="button care-action-button"
                          type="button"
                          onClick={() => handleComplete(event.id)}
                          disabled={isActionLoading}
                        >
                          <Check size={18} />
                          <span>
                            {isActionLoading ? t("processing") : t("completedAction")}
                          </span>
                        </button>

                        <button
                          className="button secondary care-action-button"
                          type="button"
                          onClick={() => handleSkip(event.id)}
                          disabled={isActionLoading}
                        >
                          <SkipForward size={18} />
                          <span>{t("skipAction")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
