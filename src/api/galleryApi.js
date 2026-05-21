import { apiClient } from "./client";

export async function getGallery() {
  const response = await apiClient.get("/gallery");
  return response.data;
}

export async function getGalleryItem(userPlantId) {
  const response = await apiClient.get(`/gallery/${userPlantId}`);
  return response.data;
}

export async function addToGallery(data) {
  const response = await apiClient.post("/gallery", data);
  return response.data;
}

export async function updateGalleryItem(userPlantId, data) {
  const response = await apiClient.patch(`/gallery/${userPlantId}`, data);
  return response.data;
}

export async function deleteGalleryItem(userPlantId) {
  await apiClient.delete(`/gallery/${userPlantId}`);
}