import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api"
});

// ✅ Attach JWT token
API.interceptors.request.use((req) => {

    const token = localStorage.getItem("token");

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});


// 🔥 ADD THIS RESPONSE INTERCEPTOR
API.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response && error.response.status === 401) {

            const token = localStorage.getItem("token");
            const currentPath = window.location.pathname;

            // 🔥 Only redirect if token exists AND not already on login page
            if (token && currentPath !== "/login") {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);
export default API;