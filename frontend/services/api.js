import axios from "axios";

const API = axios.create({
  baseURL: "https://team-crm-backend.onrender.com/api",
});

API.interceptors.request.use((req) => {

  const publicRoutes = [
    "/accounts/admin-signup/",
    "/accounts/login/",
  ];

  if (!publicRoutes.includes(req.url)) {
    const token = localStorage.getItem("access");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }

  return req;
});

export default API;