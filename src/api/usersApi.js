import { apiClient } from "./client";

export async function getMe() {
    const response = await apiClient.get("/users/me");

    return response.data;
}


export async function updateMe(data) {
    const response = await apiClient.patch("/users/me", data);
    return response.data;
}


export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}