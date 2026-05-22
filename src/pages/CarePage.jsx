import { useEffect, useMemo, useState } from "react";
import { Check, Droplets, SkipForward } from "lucide-react";

import Layout from "../components/Layout";
import {
  completeWateringEvent,
  getWateringEvents,
  skipWateringEvent,
} from "../api/careApi";
import { getGallery } from "../api/galleryApi";

const STATUS_LABELS = {
  planned: "Запланирован",
  completed: "Выполнен",
  skipped: "Пропущен",
};

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("ru-RU");
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("ru-RU");
}

export default function CarePage() {
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
          : "Не удалось загрузить события полива"
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
      await completeWateringEvent(eventId, "Полив выполнен через веб-сайт");
      await loadEvents();
    } catch (error) {
      console.log("COMPLETE WATERING ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Не удалось отметить полив выполненным"
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSkip(eventId) {
    setActionLoadingId(eventId);
    setError("");

    try {
      await skipWateringEvent(eventId, "Полив пропущен через веб-сайт");
      await loadEvents();
    } catch (error) {
      console.log("SKIP WATERING ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Не удалось пропустить полив"
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
              <h1 className="page-title">Полив</h1>
              <p className="page-subtitle">
                События ухода за растениями из вашей галереи.
              </p>
            </div>

            <div className="care-filters">
              <select
                className="input care-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Все события</option>
                <option value="planned">Запланированные</option>
                <option value="completed">Выполненные</option>
                <option value="skipped">Пропущенные</option>
              </select>

              <select
                className="input care-filter"
                value={plantFilter}
                onChange={(event) => setPlantFilter(event.target.value)}
              >
                <option value="">Все растения</option>

                {galleryItems.map((item) => {
                  const plantName =
                    item.custom_name ||
                    item.plant?.common_name ||
                    `Растение #${item.id}`;

                  return (
                    <option key={item.id} value={item.id}>
                      {plantName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {loading && <div className="card">Загрузка событий полива...</div>}

          {error && <div className="card error">{error}</div>}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="card care-empty">
              <div className="care-empty-icon">
                <Droplets size={42} />
              </div>

              <h2>Событий полива не найдено</h2>

              <p className="muted">
                Измените фильтр или добавьте растение в галерею.
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
                  `Растение #${event.user_plant_id}`;

                const scientificName = userPlant?.plant?.scientific_name;

                return (
                  <div key={event.id} className="card care-event">
                    <div className="care-event-main">
                      <div className={`care-status care-status-${event.status}`}>
                        {STATUS_LABELS[event.status] || event.status}
                      </div>

                      <h2 className="care-event-title">{plantName}</h2>

                      {scientificName && (
                        <p className="care-event-subtitle">{scientificName}</p>
                      )}

                      <div className="care-event-info">
                        <div>
                          <strong>Дата полива:</strong>{" "}
                          {formatDate(event.scheduled_date)}
                        </div>

                        {event.completed_at && (
                          <div>
                            <strong>Выполнено:</strong>{" "}
                            {formatDateTime(event.completed_at)}
                          </div>
                        )}

                        {event.note && (
                          <div>
                            <strong>Заметка:</strong> {event.note}
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
                            {isActionLoading ? "Обработка..." : "Выполнено"}
                          </span>
                        </button>

                        <button
                          className="button secondary care-action-button"
                          type="button"
                          onClick={() => handleSkip(event.id)}
                          disabled={isActionLoading}
                        >
                          <SkipForward size={18} />
                          <span>Пропустить</span>
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