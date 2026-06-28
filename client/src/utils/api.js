// Central API base URL — set VITE_API_URL in .env for production,
// otherwise falls back to the local Spring Boot server port.
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
export default API_BASE;
