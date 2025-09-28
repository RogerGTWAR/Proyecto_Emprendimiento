const BASE_URL = import.meta.env.VITE_API_URL;

export async function api(path, { method = "GET", body, token } = {}) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  console.log("[API] ->", method, url);

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const msg = json.msg || json.message || `Error ${res.status}`;
    throw new Error(msg);
  }
  return json;
}
