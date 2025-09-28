import { useEffect, useState } from "react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../data/products.js";

export function useProducts() {
  const [items, setItems] = useState([]);    
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await fetchProducts();
      setItems(list);
    } catch (e) {
      setError(e?.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (payloadUI) => {
    const created = await createProduct(payloadUI);
    setItems(prev => [created, ...prev]);
    return created;
  };

  const edit = async (id, payloadUI) => {
    const updated = await updateProduct(id, payloadUI);
    setItems(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  };

  const remove = async (id) => {
    await deleteProduct(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  return { items, loading, error, reload: load, add, edit, remove };
}
