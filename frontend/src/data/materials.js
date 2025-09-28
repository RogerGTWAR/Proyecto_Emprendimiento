import { api } from "./api.js";

const FALLBACK_IMG =
  "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg";

const normalizeKey = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "");

const toNumber = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const getCantidad = (m) => {
  const candidates = [
    m.quantity,
    m.cantidad,
    m.qty,
    m.stock,
    m.existencias,
    m.existencia,
    m.available_quantity,
    m.available,
    m.current_stock,
    m.inventory,
  ];
  for (const c of candidates) {
    const n = Number(String(c ?? "").trim());
    if (Number.isFinite(n)) return n;
  }
  return 0;
};

const getUnidad = (mu) => {
  if (!mu) return "";
  if (typeof mu === "string") return mu;
  return mu.unit_name ?? mu.name ?? "";
};

const getTags = (mt) => {
  if (!Array.isArray(mt)) return [];
  return mt
    .map((t) => {
      if (typeof t === "string") return t;
      if (t?.name) return t.name;
      if (t?.tags?.name) return t.tags.name;
      if (Array.isArray(t?.tags) && t.tags[0]?.name) return t.tags[0].name;
      return null;
    })
    .filter(Boolean);
};

const toUI = (m) => {
  const tags = getTags(m.material_tag);
  const tipo = m.type ?? tags[0] ?? "sin etiqueta";

  return {
    id: m.id,
    nombre: m.name ?? "",
    descripcion: m.description ?? "",
    tipo,
    costo: toNumber(m.unit_cost),
    unidad: getUnidad(m.material_units),
    imagen: m.material_img || FALLBACK_IMG,

    cantidad: getCantidad(m),
    medidas: m.measurements ?? m.medidas ?? "",
    tamaño: m.size ?? m.tamaño ?? "",
    material_unit_id: m.material_unit_id ?? m.material_units?.id ?? "",

    clave: normalizeKey(m.name ?? ""),
    tags,
  };
};

export const fetchMaterials = async () => {
  const { data } = await api("/materials");
  return Array.isArray(data) ? data.map(toUI) : [];
};

export const fetchMaterialById = async (id) => {
  const { data } = await api(`/materials/${id}`);
  return toUI(data);
};

export const createMaterial = async (u) => {
  const fd = new FormData();

  fd.append("name", u.nombre ?? "");
  fd.append("description", u.descripcion ?? "");
  fd.append("unit_cost", String(toNumber(u.costo)));
  fd.append("waste_percentage", String(toNumber(u.waste_percentage)));
  fd.append("company_id", String(Number(u.company_id ?? 1)));
  fd.append("material_unit_id", String(Number(u.material_unit_id ?? 1)));

  if (u.tipo !== undefined || u.type !== undefined) {
    fd.append("type", String(u.type ?? u.tipo ?? ""));
  }

  if (u.cantidad !== undefined || u.quantity !== undefined) {
    fd.append("quantity", String(Number(u.quantity ?? u.cantidad ?? 0)));
  }
  if (u.medidas !== undefined || u.measurements !== undefined) {
    fd.append("measurements", String(u.measurements ?? u.medidas ?? ""));
  }
  if (u.tamaño !== undefined || u.size !== undefined) {
    fd.append("size", String(u.size ?? u.tamaño ?? ""));
  }

  if (u.imagen instanceof File || u.imagen instanceof Blob) {
    fd.append("material_img", u.imagen);
  }

  if (Array.isArray(u.tags)) {
    u.tags.forEach((t) => fd.append("tags[]", String(t)));
  }

  const { data } = await api("/materials", { method: "POST", body: fd });
  return toUI(data);
};

export const updateMaterial = async (id, u) => {
  const fd = new FormData();

  if (u.nombre !== undefined) fd.append("name", u.nombre ?? "");
  if (u.descripcion !== undefined) fd.append("description", u.descripcion ?? "");
  if (u.costo !== undefined) fd.append("unit_cost", String(toNumber(u.costo)));
  if (u.waste_percentage !== undefined)
    fd.append("waste_percentage", String(toNumber(u.waste_percentage)));
  if (u.material_unit_id !== undefined)
    fd.append("material_unit_id", String(Number(u.material_unit_id)));

  if (u.tipo !== undefined || u.type !== undefined) {
    fd.append("type", String(u.type ?? u.tipo ?? ""));
  }

  if (u.cantidad !== undefined || u.quantity !== undefined) {
    fd.append("quantity", String(Number(u.quantity ?? u.cantidad ?? 0)));
  }
  if (u.medidas !== undefined || u.measurements !== undefined) {
    fd.append("measurements", String(u.measurements ?? u.medidas ?? ""));
  }
  if (u.tamaño !== undefined || u.size !== undefined) {
    fd.append("size", String(u.size ?? u.tamaño ?? ""));
  }

  if (u.imagen instanceof File || u.imagen instanceof Blob) {
    fd.append("material_img", u.imagen);
  }

  if (Array.isArray(u.tags)) {
    try {
      fd.delete("tags[]");
    } catch {}
    u.tags.forEach((t) => fd.append("tags[]", String(t)));
  }

  const { data } = await api(`/materials/${id}`, { method: "PATCH", body: fd });
  return toUI(data);
};

export const deleteMaterial = async (id) => {
  await api(`/materials/${id}`, { method: "DELETE" });
  return true;
};
