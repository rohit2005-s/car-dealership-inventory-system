// Minimal, dependency-free JWT payload decoder. We deliberately avoid pulling
// in a library (e.g. jwt-decode) for this — a JWT's payload is just a
// base64url-encoded JSON object, and this is the only thing we need it for:
// checking expiry on page load, and (optionally) role-aware UI elsewhere.
//
// IMPORTANT: this NEVER verifies the token's signature. It is purely for
// reading claims client-side to drive UI decisions. The backend remains the
// only real authorization boundary — every protected API call is re-checked
// there regardless of what this decodes.
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}