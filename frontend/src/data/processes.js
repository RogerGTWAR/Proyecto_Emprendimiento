import { api } from "./api.js";

const BASE_PATH = "/processes";


const toNumber = (v, def = 0) => {
  const n = Number(String(v ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : def;
};

const toPosInt = (v, def = 1) => {
  const n = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

const str = (v) => String(v ?? "").trim();


export const processToUI = (p = {}) => {
  const prod = p.products ?? {};
  const producto = {
    id: prod.id ?? null,
    nombre: prod.name ?? prod.nombre ?? "",
    estimated_time: toNumber(prod.estimated_time, 0),
    precio: toNumber(prod.price, NaN),
    totalCost: toNumber(prod.total_cost ?? prod.totalCost, NaN),
    description: prod.description ?? "",
    company_id: prod.company_id ?? null,
  };

  const servicios = Array.isArray(p.process_service)
    ? p.process_service.map((ps) => {
        const nombre = ps?.name ?? ps?.nombre ?? ps?.services?.name ?? "";
        const costoCatalogo = toNumber(ps?.cost ?? ps?.services?.cost ?? 0, 0);
        const costoServicio = toNumber(ps?.cost_service ?? 0, 0);
        return {
          id_relacion: ps?.id,
          service_id: ps?.service_id,
          nombre,
          costo_catalogo: costoCatalogo,
          costo_servicio: costoServicio,
          id: ps?.service_id,
          monto: costoServicio,
        };
      })
    : [];

  const trabajadores = Array.isArray(p.process_worker)
    ? p.process_worker.map((pw) => {
        const fullName =
          pw?.name ??
          pw?.nombre ??
          `${pw?.workers?.firstname ?? ""} ${pw?.workers?.lastname ?? ""}`.trim();

        return {
          id_relacion: pw?.id,
          worker_id: pw?.worker_id,
          nombre: fullName,
          costo_mano_obra: toNumber(pw?.cost_labor ?? 0, 0),
          id: pw?.worker_id,
        };
      })
    : [];

  const cantidad = toPosInt(p.quantity ?? 1, 1);
  const duracion_total_minutos = toPosInt(p.duration_total_minutes ?? 0, 0);

  const costoMaterialesRaw = Number.isFinite(producto.totalCost)
    ? producto.totalCost
    : Number.isFinite(producto.precio)
    ? producto.precio * cantidad
    : 0;

  const costoServiciosRaw = servicios.reduce(
    (acc, s) => acc + toNumber(s.costo_servicio ?? s.monto, 0),
    0
  );

  const costoManoObraRaw = trabajadores.reduce(
    (acc, w) => acc + toNumber(w.costo_mano_obra, 0),
    0
  );

  const costoTotalRaw = toNumber(
    p.cost_total,
    costoMaterialesRaw + costoServiciosRaw + costoManoObraRaw
  );

  const costoMateriales = Number.isFinite(costoMaterialesRaw) ? costoMaterialesRaw : 0;
  const costoServicios = Number.isFinite(costoServiciosRaw) ? costoServiciosRaw : 0;
  const costoManoObra = Number.isFinite(costoManoObraRaw) ? costoManoObraRaw : 0;
  const costoTotal = Number.isFinite(costoTotalRaw)
    ? costoTotalRaw
    : costoMateriales + costoServicios + costoManoObra;

  return {
    id: p.id,
    nombre: p.name ?? "",
    cantidad,
    product_id: p.product_id ?? producto.id ?? null,
    company_id: p.company_id ?? producto.company_id ?? null,
    duracion_total_minutos,

    costo_total: costoTotal,
    costoMateriales,
    costoServicios,
    costoManoObra,

    servicios,
    trabajadores,

    producto,

    created_at: p.created_at ?? null,
    updated_at: p.updated_at ?? null,

    duracionTotal: duracion_total_minutos,
    costoTotal: costoTotal,
  };
};

const keyService = (s) => {
  const id = toPosInt(s?.service_id ?? s?.id, NaN);
  if (Number.isFinite(id)) return `id:${id}`;
  const name = str(s?.name ?? s?.nombre ?? "");
  return name ? `name:${name.toLowerCase()}` : "";
};

const dedupServices = (arr = []) => {
  const map = new Map();
  for (const raw of arr) {
    if (!raw) continue;

    const service_id = Number.isFinite(toPosInt(raw.service_id ?? raw.id, NaN))
      ? toPosInt(raw.service_id ?? raw.id, NaN)
      : undefined;

    const name = str(raw.name ?? raw.nombre ?? "");
    const cost_catalog = toNumber(raw.cost ?? raw.costo, NaN);
    const cost_service = toNumber(
      raw.cost_service ?? raw.costo_servicio ?? raw.monto ?? raw.costo ?? 0,
      0
    );

    if (service_id == null && !name) continue;

    const clean = {};
    if (service_id != null) clean.service_id = service_id;
    if (name) clean.name = name;
    if (Number.isFinite(cost_catalog)) clean.cost = cost_catalog;
    clean.cost_service = cost_service;

    const k = keyService(clean);
    if (!k) continue;

    if (!map.has(k)) {
      map.set(k, clean);
    } else {
      const prev = map.get(k);
      map.set(k, {
        ...prev,
        cost: Number.isFinite(clean.cost)
          ? (Number.isFinite(prev.cost) ? prev.cost : clean.cost)
          : prev.cost,
        cost_service: toNumber(prev.cost_service, 0) + toNumber(clean.cost_service, 0),
      });
    }
  }
  return Array.from(map.values());
};

const dedupWorkers = (arr = []) => {
  const map = new Map();
  for (const w of arr) {
    if (!w) continue;
    const id = Number.isFinite(toPosInt(w.id, NaN)) ? toPosInt(w.id, NaN) : NaN;
    if (!Number.isFinite(id)) continue;

    const cost_explicit = toNumber(w.cost_labor ?? w.costo_mano_obra, NaN);
    const cost_labor = Number.isFinite(cost_explicit) ? cost_explicit : 0;

    if (!map.has(id)) {
      map.set(id, { id, cost_labor });
    } else {
      const prev = map.get(id);
      map.set(id, { id, cost_labor: toNumber(prev.cost_labor, 0) + toNumber(cost_labor, 0) });
    }
  }
  return Array.from(map.values());
};


const buildPayload = (data = {}) => {
  const name = data?.nombre ?? data?.name ?? "";
  const product_id = toPosInt(data?.product_id ?? data?.product?.id, NaN);

  const companyIdRaw =
    data?.company_id ?? data?.company?.id ?? data?.product?.company_id;
  const companyIdNum = toPosInt(companyIdRaw, NaN);
  const company_id = Number.isFinite(companyIdNum) ? companyIdNum : undefined;

  const quantity = toPosInt(data?.cantidad ?? data?.quantity ?? 1, 1);

  const duration_total_minutes = toPosInt(
    data?.duracion_total_minutos ??
      data?.duration_total_minutes ??
      data?.tiempo_total_minutos ??
      data?.duracionTotal ??
      0,
    0
  );
  const horas = duration_total_minutes / 60;

  const servicesArray =
    data?.services ??
    data?.servicios ??
    data?.servicios_obj ??
    data?.services_obj ??
    [];

  let services = Array.isArray(servicesArray) ? servicesArray.slice() : [];
  services = dedupServices(services);

  const extraNamesRaw =
    data?.services_names ?? data?.servicios_nombres ?? data?.process_service ?? [];
  const extraNameObjs = Array.isArray(extraNamesRaw)
    ? extraNamesRaw
        .map((n) => str(n))
        .filter(Boolean)
        .map((nm) => ({ name: nm, cost_service: 0 }))
    : [];

  if (extraNameObjs.length) {
    const setNames = new Set(
      services.map((s) => (s.name ?? "").toLowerCase()).filter(Boolean)
    );
    const onlyNew = extraNameObjs.filter(
      (e) => !setNames.has((e.name ?? "").toLowerCase())
    );
    services = dedupServices([...services, ...onlyNew]);
  }

  const workersArray =
    data?.workers ??
    data?.trabajadores ??
    data?.trabajadores_obj ??
    data?.workers_obj ??
    [];

  const workersWithHours = Array.isArray(workersArray)
    ? workersArray
        .map((w) => {
          if (!w) return null;
          const id = Number.isFinite(toPosInt(w.id, NaN)) ? toPosInt(w.id, NaN) : NaN;
          if (!Number.isFinite(id)) return null;

          const cost_explicit = toNumber(w.cost_labor ?? w.costo_mano_obra, NaN);
          const hourly =
            toNumber(w.pagoPorHora, NaN) ||
            toNumber(w.hourly_fee, NaN) ||
            NaN;

          const cost_labor =
            Number.isFinite(cost_explicit)
              ? cost_explicit
              : Number.isFinite(hourly)
              ? hourly * horas
              : 0;

          return { id, cost_labor };
        })
        .filter(Boolean)
    : [];

  const workers = dedupWorkers(workersWithHours);

  const cost_materials = toNumber(
    data?.cost_materials ??
      data?.costo_materiales ??
      data?.producto?.totalCost ??
      data?.producto?.total_cost,
    0
  );

  const cost_services = services.reduce(
    (acc, s) => acc + toNumber(s.cost_service, 0),
    0
  );
  const cost_labor_total = workers.reduce(
    (acc, w) => acc + toNumber(w.cost_labor, 0),
    0
  );

  const cost_total = toNumber(
    data?.cost_total ?? data?.costo_total,
    cost_materials + cost_services + cost_labor_total
  );

  if (!Number.isFinite(product_id)) {
    throw new Error("Falta product_id (numérico)");
  }

  const payload = {
    name,
    product_id,
    quantity,
    duration_total_minutes,
    cost_total,
    services,
    workers,
  };

  if (Number.isFinite(companyIdNum)) {
    payload.company_id = company_id;
  }

  return payload;
};


export async function fetchProcesses() {
  try {
    const json = await api(`${BASE_PATH}`, { method: "GET" });
    if (!json?.ok) {
      console.warn("[fetchProcesses] ok=false payload:", json);
      return [];
    }
    const rows = Array.isArray(json.data) ? json.data : [];
    return rows.map(processToUI);
  } catch (e) {
    console.error("[fetchProcesses] error:", e);
    return [];
  }
}

export async function fetchProcessById(id) {
  const json = await api(`${BASE_PATH}/${id}`, { method: "GET" });
  return processToUI(json?.data ?? {});
}

export async function createProcess(input) {
  const body = buildPayload(input);
  const json = await api(`${BASE_PATH}`, { method: "POST", body });
  return processToUI(json?.data ?? {});
}

export async function updateProcess(id, input) {
  const body = buildPayload(input);
  const json = await api(`${BASE_PATH}/${id}`, { method: "PATCH", body });
  return processToUI(json?.data ?? {});
}

export async function deleteProcess(id) {
  const json = await api(`${BASE_PATH}/${id}`, { method: "DELETE" });
  return { ok: !!json?.ok, id: json?.id ?? id };
}

export async function fetchProcessesByCompany(companyId) {
  const all = await fetchProcesses();
  const id = Number(companyId);
  if (!Number.isFinite(id)) return all;
  return all.filter((p) => Number(p.company_id) === id);
}
