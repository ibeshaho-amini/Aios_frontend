import axios from 'axios';

// Create an axios instance with a base URL (NO default Content-Type)
const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,
  // Do NOT set headers here!
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization Header:", config.headers.Authorization);  
    }
    return config;  
  },
  (error) => Promise.reject(error)  
);

axiosInstance.interceptors.response.use(
  (response) => response,  
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized, redirecting to login...');
      // Redirect to login page on 401 Unauthorized
        window.location.href = '/login';
    }
    return Promise.reject(error);  // Forward any response error
  }
);

export default axiosInstance;
