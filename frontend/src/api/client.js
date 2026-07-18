import axios from "axios";
import { API_URL } from "../config/api";

let currentToken = null;

export function setAuthToken(token) {
  currentToken = token;
}

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

export function getErrorMessage(err) {
  if (err.response && err.response.data && err.response.data.error) {
    return err.response.data.error.message;
  }
  if (err.message) return err.message;
  return "Something went wrong. Please try again.";
}

export default apiClient;