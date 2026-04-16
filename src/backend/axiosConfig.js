import axios from 'axios';

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}api` || 'http://localhost:8000/api', 
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesi berakhir atau tidak terotorisasi.");
      if (!window.location.pathname.includes('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;