import { apiClient } from "./client";

export async function recognizePlant(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/plants/recognize", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function mockRecognizePlant() {
  const response = await apiClient.post("/plants/mock-recognize");
  return response.data;
}