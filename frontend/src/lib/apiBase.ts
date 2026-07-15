/**
 * Base URL of the backend API. The Web UI used to serve its own API
 * routes via Next.js (src/app/api/), but the backend is now the separate
 * Python (FastAPI) service in ../Backend (Python) — see that folder's
 * README for how to run it. Override via NEXT_PUBLIC_API_BASE_URL if the
 * backend isn't running on the default port.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
