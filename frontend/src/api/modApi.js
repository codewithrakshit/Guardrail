const API_BASE = '/api';

export const fetchPatches = async (sessionId) => {
  const url = sessionId
    ? `${API_BASE}/patch?sessionId=${encodeURIComponent(sessionId)}`
    : `${API_BASE}/patch`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch patches: ${res.statusText}`);
  }
  const data = await res.json();
  return data;
};
