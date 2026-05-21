import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import RecognizePage from "../pages/RecognizePage";
import ConfirmPlantPage from "../pages/ConfirmPlantPage";
import GalleryPage from "../pages/GalleryPage";
import GalleryItemPage from "../pages/GalleryItemPage";
import CarePage from "../pages/CarePage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/gallery" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recognize"
          element={
            <ProtectedRoute>
              <RecognizePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/confirm-plant"
          element={
            <ProtectedRoute>
              <ConfirmPlantPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <GalleryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gallery/:id"
          element={
            <ProtectedRoute>
              <GalleryItemPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/care"
          element={
            <ProtectedRoute>
              <CarePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}