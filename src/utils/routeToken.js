export function encodeRouteToken(value) {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodeRouteToken(token) {
  const normalized = token
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return JSON.parse(atob(padded));
}