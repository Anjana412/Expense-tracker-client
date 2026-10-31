// Session helpers shared by route guards and the public pages.
export function tokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true; // unreadable token = treated as signed out
  }
}

export function getSession() {
  const token = localStorage.getItem("token");
  let user;
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch { return null; }
  if (!token || !user?.role || tokenExpired(token)) return null;
  return { token, user };
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
