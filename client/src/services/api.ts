import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL;
const baseURL = apiBase ? `${apiBase}/api` : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: !!apiBase,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // global error handling
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  },
);

export default api;
