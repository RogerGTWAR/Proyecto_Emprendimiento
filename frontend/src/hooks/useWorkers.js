import { useEffect, useState } from "react";
import { fetchWorkers, createWorker, updateWorker, deleteWorker } from "../data/workers.js";

export function useWorkers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await fetchWorkers();
      setItems(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (payloadUI) => {
    const created = await createWorker(payloadUI);
    setItems(prev => [created, ...prev]);
  };

  const edit = async (id, payloadUI) => {
    const updated = await updateWorker(id, payloadUI);
    setItems(prev => prev.map(w => (w.id === id ? updated : w)));
  };

  const remove = async (id) => {
    await deleteWorker(id);
    setItems(prev => prev.filter(w => w.id !== id));
  };

  return { items, loading, error, reload: load, add, edit, remove };
}
