import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
} from "../data/services.js";

export function useServices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchServices();
      setItems(rows);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (data) => {
    const created = await createService(data);
    setItems(prev => [created, ...prev]);
    return created;
  }, []);

  const edit = useCallback(async (id, data) => {
    const updated = await updateService(id, data);
    setItems(prev => prev.map(it => (it.id === id ? updated : it)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteService(id);
    setItems(prev => prev.filter(it => it.id !== id));
    return true;
  }, []);

  const byId = useMemo(() => Object.fromEntries(items.map(s => [s.id, s])), [items]);

  return { items, byId, loading, error, reload: load, add, edit, remove };
}
