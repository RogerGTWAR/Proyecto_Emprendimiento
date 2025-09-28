import { api } from "./api.js";

const normalizeKey = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "");

const toNumber = (v) => Number(String(v ?? "").replace(",", "."));

const toUI = (w) => ({
  id: w.id,
  nombre: w.firstname ?? "",
  apellido: w.lastname ?? "",
  pagoPorHora: toNumber(w.hourly_fee),              
  department_id: w.department_id ?? null,          
  departamentoClave: normalizeKey(w.departments ?? ""),
  departamentoNombre: w.departments ?? "Sin departamento", 
});

export const fetchWorkers = async () => {
  const { data } = await api("/workers");
  return data.map(toUI);
};

export const createWorker = async (u) => {
  const body = {
    firstname: u.nombre,
    lastname: u.apellido,
    hourly_fee: toNumber(u.pagoPorHora),   
    department_id: Number(u.department_id),
  };
  const { data } = await api("/workers", { method: "POST", body });
  return toUI(data);
};

export const updateWorker = async (id, u) => {
  const body = {
    ...(u.nombre !== undefined ? { firstname: u.nombre } : {}),
    ...(u.apellido !== undefined ? { lastname: u.apellido } : {}),
    ...(u.pagoPorHora !== undefined ? { hourly_fee: toNumber(u.pagoPorHora) } : {}),
    ...(u.department_id !== undefined ? { department_id: Number(u.department_id) } : {}),
  };
  const { data } = await api(`/workers/${id}`, { method: "PATCH", body });
  return toUI(data);
};

export const deleteWorker = async (id) => {
  await api(`/workers/${id}`, { method: "DELETE" });
  return true;
};
