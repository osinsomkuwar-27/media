// SINGLE SOURCE OF TRUTH for the backend URL.
// Change ONLY this value to point at local LAN IP or the deployed backend.
// Example for physical device on local network: "http://192.168.1.25:5000"
export const API_BASE_URL = "http://10.240.179.51:5000";

export const API_PREFIX = "/api/v1";

export const API_URL = `${API_BASE_URL}${API_PREFIX}`;