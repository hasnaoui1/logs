import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});


function isTokenExpired(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

axiosInstance.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");

      Swal.fire({
        title: "Session Expired",
        text: "Please log in again.",
        icon: "warning",
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "bottom-end",
      });

      window.location.href = "/login";
      return Promise.reject(new Error("Token expired"));
    }

    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("Axios Error:", error);

    let interceptorError = { message: "An unexpected error occurred" };

    if (error.response) {
      if (error.response.status === 404) {
        Swal.fire({
          title: "Server Error",
          icon: "error",
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          position: "bottom-end",
        });
      }

      interceptorError.message =
        error.response.data.message || error.response.data.error || "Server error";
    } else if (error.request) {
      interceptorError.message = "No response from server";
    } else {
      interceptorError.message = error.message;
    }

    return Promise.reject(interceptorError);
  }
);

export default axiosInstance;
