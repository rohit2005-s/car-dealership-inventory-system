import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Centralizes error handling: the backend always responds with
// { success: false, message } on failure (see errorMiddleware). This
// interceptor normalizes that into a plain Error with that message, so
// every caller can just do `catch (err) { toast.error(err.message) }`
// instead of digging into err.response.data.message everywhere.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export default api;