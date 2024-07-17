// src/api/apiConfig.ts
import axios from "axios";

const apiConfig = axios.create({
  baseURL: "http://localhost:3000/api", // Adjust as per your backend route structure
  withCredentials: true, // Send cookies along with requests
  timeout: 5000, // Timeout after 5 seconds
});

export default apiConfig;
