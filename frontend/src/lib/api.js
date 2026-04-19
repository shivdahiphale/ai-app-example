import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hero_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      // Don't auto-redirect on 401 from /auth/me (initial load check)
      const url = err.config?.url || "";
      if (!url.includes("/auth/me")) {
        localStorage.removeItem("hero_token");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
