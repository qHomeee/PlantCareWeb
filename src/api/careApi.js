import { apiClient } from "./client";

export async function getWateringEvents(status = null) {
  const params = status ? { status } : {};
  const response = await apiClient.get("/care/watering-events", { params });
  return response.data;
}

export async function getTodayWateringEvents() {
  const response = await apiClient.get("/care/watering-events/today");
  return response.data;
}

export async function getPlantWateringEvents(userPlantId, status = null) {
  const params = status ? { status } : {};

  const response = await apiClient.get(
    `/care/user-plants/${userPlantId}/watering-events`,
    { params }
  );

  return response.data;
}

export async function completeWateringEvent(eventId, note = null) {
  const response = await apiClient.patch(
    `/care/watering-events/${eventId}/complete`,
    { note }
  );

  return response.data;
}

export async function skipWateringEvent(eventId, note = null) {
  const response = await apiClient.patch(
    `/care/watering-events/${eventId}/skip`,
    { note }
  );

  return response.data;
}