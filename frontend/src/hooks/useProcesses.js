import { useEffect, useState, useCallback, useMemo } from "react";
import {
  fetchProcesses,
  fetchProcessById,
  createProcess,
  updateProcess,
  deleteProcess,
} from "../data/processes.js";

export function useProcesses({ autoLoad = true } = {}) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setError("");
    setLoadingList(true);
    try {
      const rows = await fetchProcesses();
      setItems(rows);
    } catch (e) {
      setError(e?.message || "No se pudieron cargar los procesos");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadById = useCallback(async (id) => {
    setError("");
    setLoadingItem(true);
    try {
      const row = await fetchProcessById(id);
      setSelected(row);
      return row;
    } catch (e) {
      setError(e?.message || "No se pudo cargar el proceso");
      return null;
    } finally {
      setLoadingItem(false);
    }
  }, []);

  const create = useCallback(async (data) => {
    setError("");
    setSaving(true);
    try {
      const created = await createProcess(data);
      setItems((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      setError(e?.message || "No se pudo crear el proceso");
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(async (id, data) => {
    setError("");
    setSaving(true);
    try {
      const upd = await updateProcess(id, data);
      setItems((prev) => prev.map((p) => (p.id === id ? upd : p)));
      setSelected((cur) => (cur && cur.id === id ? upd : cur));
      return upd;
    } catch (e) {
      setError(e?.message || "No se pudo actualizar el proceso");
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setError("");
    setRemoving(true);
    try {
      const r = await deleteProcess(id);
      if (r.ok) {
        setItems((prev) => prev.filter((p) => p.id !== id));
        setSelected((cur) => (cur && cur.id === id ? null : cur));
      }
      return r;
    } catch (e) {
      setError(e?.message || "No se pudo eliminar el proceso");
      return { ok: false };
    } finally {
      setRemoving(false);
    }
  }, []);

  const reload = useCallback(() => loadAll(), [loadAll]);

  useEffect(() => {
    if (autoLoad) loadAll();
  }, [autoLoad, loadAll]);

  const flags = useMemo(
    () => ({
      loadingList,
      loadingItem,
      saving,
      removing,
      busy: loadingList || loadingItem || saving || removing,
    }),
    [loadingList, loadingItem, saving, removing]
  );

  return {
    items,
    selected,
    error,
    ...flags,
    loadAll,
    loadById,
    create,
    update,
    remove,
    reload,
    setSelected,
    setItems,
  };
}
