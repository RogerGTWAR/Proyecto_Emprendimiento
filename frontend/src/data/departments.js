import { api } from "./api.js";

const normalizeKey = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "");

const toUI = (d) => ({
  id: d.id,
  nombre: d.name ?? "",
  clave: normalizeKey(d.name ?? ""), 
});

export const fetchDepartments = async () => {
  const { data } = await api("/departments"); 
  return data.map(toUI);
};

export const fetchDepartmentOptions = async () => {
  const list = await fetchDepartments();
  return list.map(d => ({ value: d.id, label: d.nombre }));
};

export const fetchDepartmentsMap = async () => {
  const list = await fetchDepartments();
  return Object.fromEntries(list.map(d => [d.id, d]));
};
