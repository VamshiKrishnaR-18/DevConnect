import axios from "axios";
import config from "../config/environment";

const api = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

export default api;
