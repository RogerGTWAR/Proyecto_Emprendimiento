// src/hooks/useMaterials.js
import { useEffect, useState } from "react";
import {
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from "../data/materials.js";

export function useMaterials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await fetchMaterials();
      setItems(list);
    } catch (e) {
      setError(e?.message || "Error al cargar materiales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (payloadUI) => {
    const created = await createMaterial(payloadUI);
    setItems(prev => [created, ...prev]);
    return created;
  };

  const edit = async (id, payloadUI) => {
    const updated = await updateMaterial(id, payloadUI);
    setItems(prev => prev.map(m => (m.id === id ? updated : m)));
    return updated;
  };

  const remove = async (id) => {
    await deleteMaterial(id);
    setItems(prev => prev.filter(m => m.id !== id));
  };

  return { items, loading, error, reload: load, add, edit, remove };
}
