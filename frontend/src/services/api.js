import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("reflex_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        const authenticationFailure =
            (status === 401 &&
                message === "Authentication token is required") ||
            (status === 403 &&
                message ===
                    "Invalid or expired authentication token");

        if (authenticationFailure) {
            window.dispatchEvent(
                new Event("reflex:auth-expired")
            );
        }

        return Promise.reject(error);
    }
);

export default api;