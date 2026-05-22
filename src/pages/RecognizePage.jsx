import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import { recognizePlant, mockRecognizePlant } from "../api/plantsApi";
import { getMediaUrl } from "../utils/media";

export default function RecognizePage() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile || null);
    setResult(null);
    setError("");

    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl("");
    }
  }

  async function handleRecognize(event) {
    event.preventDefault();

    if (!file) {
      setError("Выберите изображение растения");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await recognizePlant(file);
      setResult(data);
    } catch (error) {
      console.log("RECOGNIZE ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Не удалось распознать растение"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMockRecognize() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await mockRecognizePlant();
      setResult(data);
    } catch (error) {
      console.log("MOCK RECOGNIZE ERROR:", error);

      const detail = error.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Не удалось выполнить тестовое распознавание"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!result) {
      return;
    }

    sessionStorage.setItem("recognized_plant", JSON.stringify(result));
    navigate("/confirm-plant");
  }

  return (
    <Layout>
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Распознавание растения</h1>
            <p className="page-subtitle">
              Загрузите фотографию растения, чтобы определить его вид и получить
              рекомендации по уходу.
            </p>
          </div>

          <div className="recognize-grid">
            <div className="card">
              <h2>Загрузка фото</h2>

              <form className="form" onSubmit={handleRecognize}>
                <label>
                  Фотография растения
                  <input
                    className="input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />
                </label>

                {previewUrl && (
                  <div className="preview-box">
                    <img
                      className="preview-image"
                      src={previewUrl}
                      alt="Предпросмотр растения"
                    />
                  </div>
                )}

                {error && <div className="error">{error}</div>}

                <div className="recognize-actions">
                  <button className="button full" type="submit" disabled={loading}>
                    {loading ? "Распознавание..." : "Распознать растение"}
                  </button>

                  <button
                    className="button secondary full"
                    type="button"
                    onClick={handleMockRecognize}
                    disabled={loading}
                  >
                    Тестовое распознавание
                  </button>
                </div>
              </form>
            </div>

            <div className="card">
              <h2>Результат</h2>

              {!result && (
                <p className="muted">
                  После распознавания здесь появится информация о растении.
                </p>
              )}

              {result && (
                <div className="plant-result">
                  {result.image_url && (
                    <img
                      className="plant-result-image"
                      src={getMediaUrl(result.image_url)}
                      alt={result.common_name}
                    />
                  )}

                  <div>
                    <h3>{result.common_name}</h3>
                    <p className="muted">{result.scientific_name}</p>
                    <p>{result.description}</p>

                    <div className="info-list">
                      <div>
                        <strong>Уверенность:</strong>{" "}
                        {Math.round(result.confidence * 100)}%
                      </div>

                      <div>
                        <strong>Полив:</strong> каждые{" "}
                        {result.watering_interval_days} дн.
                      </div>

                      <div>
                        <strong>Температура:</strong>{" "}
                        {result.min_temperature_celsius}–
                        {result.max_temperature_celsius} °C
                      </div>

                      <div>
                        <strong>Освещение:</strong> {result.light_info}
                      </div>
                    </div>

                    <button className="button" onClick={handleConfirm}>
                      Подтвердить и продолжить
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}