import { api } from "./api.js";

const normalizeKey = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .toLowerCase().replace(/\s+/g, "");

const toNumber = (v) => Number(String(v ?? "").replace(",", "."));

const toUI = (m) => ({
  id: m.id,
  nombre: m.name ?? "",
  descripcion: m.description ?? "",
  tipo: Array.isArray(m.material_tag) && m.material_tag.length ? m.material_tag[0] : "sin etiqueta",
  costo: toNumber(m.unit_cost),
  unidad: m.material_units ?? "",         
  imagen: m.material_img ?? "",
  cantidad: m.cantidad ?? 1,
  medidas: m.medidas ?? "",
  tamaño: m.tamaño ?? "",
  clave: normalizeKey(m.name ?? ""),
});

export const fetchMaterials = async () => {
  const { data } = await api("/materials");
  return data.map(toUI);
};

export const fetchMaterialById = async (id) => {
  const { data } = await api(`/materials/${id}`);
  return toUI(data);
};

export const createMaterial = async (u) => {
  const company_id = Number(u.company_id ?? 1);
  const material_unit_id = Number(u.material_unit_id ?? 1);

  const body = {
    name: u.nombre,
    description: u.descripcion,
    unit_cost: toNumber(u.costo),
    waste_percentage: toNumber(u.waste_percentage ?? 0),
    company_id,
    material_unit_id,
    material_img: typeof u.imagen === "string" ? u.imagen : null,
  };

  const { data } = await api("/materials", { method: "POST", body });
  return toUI(data);
};

export const updateMaterial = async (id, u) => {
  const body = {
    ...(u.nombre !== undefined ? { name: u.nombre } : {}),
    ...(u.descripcion !== undefined ? { description: u.descripcion } : {}),
    ...(u.costo !== undefined ? { unit_cost: toNumber(u.costo) } : {}),
    ...(u.waste_percentage !== undefined ? { waste_percentage: toNumber(u.waste_percentage) } : {}),
    ...(u.material_unit_id !== undefined ? { material_unit_id: Number(u.material_unit_id) } : {}),
    ...(u.imagen !== undefined
      ? { material_img: typeof u.imagen === "string" ? u.imagen : null }
      : {}),

  };

  const { data } = await api(`/materials/${id}`, { method: "PATCH", body });
  return toUI(data);
};

export const deleteMaterial = async (id) => {
  await api(`/materials/${id}`, { method: "DELETE" });
  return true;
};
