import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, UploadCloud } from "lucide-react";

import Layout from "../components/Layout";
import { recognizePlant, mockRecognizePlant } from "../api/plantsApi";
import { useLanguage } from "../i18n/LanguageContext";
import { getMediaUrl } from "../utils/media";

export default function RecognizePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      setError(t("selectPlantImage"));
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
        typeof detail === "string" ? detail : t("recognizeFailed")
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
          : t("mockRecognizeFailed")
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
            <h1 className="page-title">{t("recognizeTitle")}</h1>
            <p className="page-subtitle">
              {t("recognizeSubtitle")}
            </p>
          </div>

          <div className="recognize-grid">
            <div className="card">
              <h2>{t("uploadTitle")}</h2>

              <form className="form" onSubmit={handleRecognize}>
                <label className="upload-dropzone">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    <img
                      className="preview-image"
                      src={previewUrl}
                      alt="Предпросмотр растения"
                    />
                  ) : (
                    <span className="upload-icon">
                      <UploadCloud size={34} />
                    </span>
                  )}

                  <span className="upload-copy">
                    <strong>
                      {file ? file.name : t("choosePlantPhoto")}
                    </strong>
                    <small>
                      {file
                        ? t("replacePlantPhoto")
                        : t("uploadHint")}
                    </small>
                  </span>

                  <span className="upload-action">
                    <ImagePlus size={18} />
                    {t("browse")}
                  </span>
                </label>

                {error && <div className="error">{error}</div>}

                <div className="recognize-actions">
                  <button className="button full" type="submit" disabled={loading}>
                    {loading ? t("recognizeLoading") : t("recognizePlant")}
                  </button>

                  <button
                    className="button secondary full"
                    type="button"
                    onClick={handleMockRecognize}
                    disabled={loading}
                  >
                    {t("testRecognition")}
                  </button>
                </div>
              </form>
            </div>

            <div className="card">
              <h2>{t("result")}</h2>

              {!result && (
                <p className="muted">
                  {t("resultEmpty")}
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
                        <strong>{t("confidence")}</strong>{" "}
                        {Math.round(result.confidence * 100)}%
                      </div>

                      <div>
                        <strong>{t("watering")}</strong>{" "}
                        {t("everyDays", {
                          days: result.watering_interval_days,
                        })}
                      </div>

                      <div>
                        <strong>{t("temperature")}</strong>{" "}
                        {result.min_temperature_celsius}–
                        {result.max_temperature_celsius} °C
                      </div>

                      <div>
                        <strong>{t("lighting")}</strong> {result.light_info}
                      </div>
                    </div>

                    <button className="button" onClick={handleConfirm}>
                      {t("confirmAndContinue")}
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
