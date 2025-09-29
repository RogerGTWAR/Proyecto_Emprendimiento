import { api } from "./api.js";

const toNumber = (v, d = 0) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : d;
};

const toUI = (s = {}) => ({
  id: s.id,
  nombre: s.name ?? "",
  costo: toNumber(s.cost, 0),
});

export async function fetchServices() {
  const json = await api("/services", { method: "GET" });
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows.map(toUI);
}

export async function fetchServiceById(id) {
  const json = await api(`/services/${id}`, { method: "GET" });
  return toUI(json?.data ?? {});
}

export async function createService(input) {
  const body = {
    name: String(input?.nombre ?? input?.name ?? "").trim(),
    cost: toNumber(input?.costo ?? input?.cost, 0),
  };
  const json = await api("/services", { method: "POST", body });
  return toUI(json?.data ?? {});
}

export async function updateService(id, input) {
  const body = {};
  if (input?.nombre !== undefined || input?.name !== undefined) {
    body.name = String(input?.nombre ?? input?.name ?? "").trim();
  }
  if (input?.costo !== undefined || input?.cost !== undefined) {
    body.cost = toNumber(input?.costo ?? input?.cost, 0);
  }
  const json = await api(`/services/${id}`, { method: "PATCH", body });
  return toUI(json?.data ?? {});
}

export async function deleteService(id) {
  const json = await api(`/services/${id}`, { method: "DELETE" });
  return { ok: !!json?.ok, id: json?.id ?? id };
}

export async function fetchServiceOptions() {
  const list = await fetchServices();
  return list.map(s => ({
    value: s.id,
    label: `${s.nombre} ($${s.costo.toFixed(2)})`,
  }));
}
