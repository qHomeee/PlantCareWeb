import axios from "axios";


export const API_BASE_URL = import.meta.env.API_BASE_URL;

export const apiClient = axios.create({
       baseURL: `${API_BASE_URL}/api/v1`,
});

apiClient.interceptors.request.use((config) =>{
    const token = localStorage.getItem("access_token");
    if(token){
        config.headers.Authorization = `Beare ${token}`
    }
    return token;
});


apiClient.interceptors.response.user(
    (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
    }

    return Promise.reject(error);
  }
);