const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Ticketing System';
export const API_BASE_URL = rawApiBaseUrl || 'http://localhost:4000';
