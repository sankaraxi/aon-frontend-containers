const BACKEND_API_BASE = import.meta.env.VITE_BACKEND_API_URL;

export function getBackendApiUrl(path) {
  return `${BACKEND_API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getCandidateRuntimeApiUrl(path) {
  const runtimeBase = sessionStorage.getItem('containerApiBase') || BACKEND_API_BASE;
  console.log('Using runtime API base:', runtimeBase);
  return `${runtimeBase}${path.startsWith('/') ? path : `/${path}`}`;
}
