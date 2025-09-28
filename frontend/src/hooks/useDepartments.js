import { useCallback, useEffect, useState } from "react";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../data/departments";

export default function useDepartments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchDepartments();
      setItems(res?.data ?? []);
    } catch (e) {
      setError(e.message || "Error al cargar departamentos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (dto) => {
    const res = await createDepartment(dto);
    await load();
    return res;
  };

  const edit = async (id, dto) => {
    const res = await updateDepartment(id, dto);
    await load();
    return res;
  };

  const remove = async (id) => {
    const res = await deleteDepartment(id);
    await load();
    return res;
  };

  return { items, loading, error, reload: load, add, edit, remove };
}
