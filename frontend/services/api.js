import axios from "axios";

const API = axios.create({
  baseURL: "https://team-crm-backend.onrender.com/api",
});

// PUBLIC ROUTES
const publicRoutes = [
  "/accounts/login/",
  "/accounts/admin-signup/",
];

API.interceptors.request.use(
  (req) => {

    // token only for protected routes
    if (!publicRoutes.includes(req.url)) {

      const token = localStorage.getItem("access");

      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }

    }

    return req;
  },

  (error) => Promise.reject(error)
);

export default API;