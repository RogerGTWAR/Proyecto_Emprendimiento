import { useEffect, useState } from "react";
import {
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../data/materials";

export function useMaterials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchMaterials();
        setItems(list);
      } catch (e) {
        setError(e.message || "Error al cargar materiales");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const add = async (formUI) => {
    const creado = await createMaterial(formUI);       
    setItems((prev) => [creado, ...prev]);             
    return creado;
  };

  const edit = async (id, formUI) => {
    const actualizado = await updateMaterial(id, formUI); 
    setItems((prev) => prev.map((m) => (m.id === id ? actualizado : m)));
    return actualizado;
  };

  const remove = async (id) => {
    await deleteMaterial(id);
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  return { items, loading, error, add, edit, remove };
}
