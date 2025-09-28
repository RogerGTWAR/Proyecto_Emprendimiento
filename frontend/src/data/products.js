import { api } from "./api.js";

const normalizeKey = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "");

const toNumber = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};
const toPosInt = (v) => {
  const n = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : NaN;
};
const toPosNumber = (v) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : NaN;
};


const toUI = (d) => {
  const nombre = d.nombre ?? d.name ?? "";
  const estimated = d.estimated_time ?? d.estimatedTime ?? null;
  const margin = d.profit_margin ?? d.profitMargin ?? null;

  return {
    id: d.id,
    nombre,
    description: d.description ?? d.descripcion ?? "",
    descripcion: d.descripcion ?? d.description ?? "",
    imagen: d.product_img ?? d.imagen ?? d.imageUrl ?? "",

    estimated_time: estimated,
    profit_margin: margin,

    tiempo: estimated == null ? null : Number(estimated),
    margen: margin == null ? null : Number(margin),

    totalCost: Number(d.total_cost ?? 0),

    etiquetas: Array.isArray(d.product_tag) ? d.product_tag : [],
    clave: normalizeKey(nombre),
  };
};


const toUIDetail = (d) => {
  const base = toUI(d);

  const pms = Array.isArray(d.product_material) ? d.product_material : [];
  const materials = pms.map((pm) => {
    const tags = Array.isArray(pm.material_tag) ? pm.material_tag.slice() : [];
    const tipo = tags.length ? tags[0] : "sin etiqueta";

    return {
      id: pm.id,
      nombre: pm.name ?? "",
      imagen: pm.material_img ?? "",
      tipo,
      unidad: pm.material_units ?? "",             
      costo: Number(pm.unit_cost ?? 0),            
      units: Number(pm.quantity ?? 1),             
      waste: Number(pm.waste_percentage ?? 0),    
      etiquetas: tags,
      cost: pm.cost != null ? Number(pm.cost) : undefined, 
    };
  });

  const total_cost =
    d.total_cost != null
      ? Number(d.total_cost)
      : materials.every((x) => Number.isFinite(x.cost))
      ? materials.reduce((acc, x) => acc + x.cost, 0)
      : materials.reduce(
          (acc, m) => acc + m.costo * (m.units || 1) * (1 + (m.waste || 0)/100),
          0
        );

  return { ...base, materials, total_cost };
};

export const fetchProducts = async () => {
  const { data } = await api("/products");
  return data.map(toUI);
};

export const fetchProductById = async (id) => {
  const { data } = await api(`/products/${id}`);
  return toUIDetail(data);
};


export const fetchProductOptions = async () => {
  const list = await fetchProducts();
  return list.map((p) => ({ value: p.id, label: p.nombre }));
};

export const fetchProductsMap = async () => {
  const list = await fetchProducts();
  return Object.fromEntries(list.map((p) => [p.id, p]));
};

const toAPIMaterialsArray = (arr = []) =>
  arr
    .map((m) => {
      const id = Number(m.id);
      const qRaw = m.quantity ?? m.units ?? m.cantidad ?? 1;
      const q = Math.max(1, parseInt(String(qRaw), 10) || 1);
      return { id, quantity: q };
    })
    .filter((x) => Number.isFinite(x.id) && Number.isFinite(x.quantity) && x.quantity > 0);

export const createProduct = async (u) => {
  const fd = new FormData();

  fd.append("name", u.nombre ?? "");

  const desc = (u.description ?? u.descripcion ?? "");
  fd.append("description", desc);

  const est = !Number.isNaN(toPosInt(u.estimated_time ?? u.tiempo))
    ? toPosInt(u.estimated_time ?? u.tiempo)
    : NaN;
  if (Number.isNaN(est)) {
    throw new Error("El tiempo estimado debe ser un entero > 0.");
  }
  fd.append("estimated_time", String(est));

  const marginInput = u.profit_margin ?? u.margen ?? 1;
  const margin = !Number.isNaN(toPosNumber(marginInput)) ? toPosNumber(marginInput) : NaN;
  if (Number.isNaN(margin)) {
    throw new Error("El margen de ganancia debe ser un número > 0.");
  }
  fd.append("profit_margin", String(margin));

  fd.append("company_id", String(Number(u.company_id ?? 1)));

  if (u.imagen instanceof File || (typeof Blob !== "undefined" && u.imagen instanceof Blob)) {
    fd.append("product_img", u.imagen);
  } else if (typeof u.imagen === "string" && u.imagen.trim()) {
    fd.append("product_img", u.imagen.trim());
  }

  const matsInput = Array.isArray(u.materials) ? u.materials : u.materiales;
  if (Array.isArray(matsInput)) {
    fd.append("materials", JSON.stringify(toAPIMaterialsArray(matsInput)));
  }

  if (Array.isArray(u.tags)) {
    u.tags.forEach((t) => fd.append("tags[]", String(t)));
  }

  const { data } = await api("/products", { method: "POST", body: fd });
  return toUIDetail(data);
};

export const updateProduct = async (id, u) => {
  const fd = new FormData();

  if (u.nombre !== undefined) fd.append("name", u.nombre ?? "");
  if (u.description !== undefined || u.descripcion !== undefined) {
    fd.append("description", (u.description ?? u.descripcion ?? ""));
  }

  if (u.estimated_time !== undefined || u.tiempo !== undefined) {
    const est = toPosInt(u.estimated_time ?? u.tiempo);
    if (Number.isNaN(est)) {
      throw new Error("El tiempo estimado debe ser un entero > 0.");
    }
    fd.append("estimated_time", String(est));
  }

  if (u.profit_margin !== undefined || u.margen !== undefined) {
    const margin = toPosNumber(u.profit_margin ?? u.margen);
    if (Number.isNaN(margin)) {
      throw new Error("El margen de ganancia debe ser un número > 0.");
    }
    fd.append("profit_margin", String(margin));
  }

  if (u.company_id !== undefined) {
    fd.append("company_id", String(Number(u.company_id)));
  }

  if (u.imagen instanceof File || (typeof Blob !== "undefined" && u.imagen instanceof Blob)) {
    fd.append("product_img", u.imagen);
  } else if (typeof u.imagen === "string") {
    fd.append("product_img", u.imagen.trim());
  }

  if (u.materials !== undefined || u.materiales !== undefined) {
    const matsInput = Array.isArray(u.materials) ? u.materials : u.materiales;
    fd.append("materials", JSON.stringify(toAPIMaterialsArray(matsInput ?? [])));
  }

  if (u.tags !== undefined) {
    const tagsArr = Array.isArray(u.tags) ? u.tags : [u.tags];
    tagsArr.forEach((t) => fd.append("tags[]", String(t)));
  }

  const { data } = await api(`/products/${id}`, { method: "PATCH", body: fd });
  return toUIDetail(data);
};

export const deleteProduct = async (id) => {
  await api(`/products/${id}`, { method: "DELETE" });
  return true;
};
