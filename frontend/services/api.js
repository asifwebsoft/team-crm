
import axios from "axios";

const API = axios.create({
  baseURL: "https://team-crm-backend.onrender.com/api",
});

// Request interceptor
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("access");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;