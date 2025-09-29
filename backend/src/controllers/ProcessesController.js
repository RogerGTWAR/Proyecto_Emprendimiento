import prisma from "../database.js";


const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

async function findOrCreateServiceByName(name, cost = 0) {
  const n = String(name).trim();
  let svc = await prisma.services.findFirst({
    where: { deleted_at: null, name: { equals: n, mode: "insensitive" } },
  });
  if (svc) return svc;

  svc = await prisma.services.create({
    data: { name: n, cost: num(cost, 0) },
  });
  return svc;
}

async function normalizeServicesPayload(arr = []) {
  const out = [];
  const seen = new Set(); // 👈 evitar repetidos por service_id

  for (const s of Array.isArray(arr) ? arr : []) {
    if (!s) continue;

    let svcRow = null;

    const rawId = s.service_id ?? s.id;
    if (rawId != null) {
      const id = Number(rawId);
      if (!Number.isFinite(id)) continue;

      svcRow = await prisma.services.findFirst({
        where: { id, deleted_at: null },
      });
      if (!svcRow) throw new Error(`Servicio id=${id} no existe o está inactivo`);
    } else if (s.name) {
      svcRow = await findOrCreateServiceByName(s.name, s.cost);
    } else {
      continue;
    }

    const key = svcRow.id; // clave única
    if (seen.has(key)) continue;   // 👈 evita duplicados
    seen.add(key);

    out.push({
      service_id: svcRow.id,
      cost_service: num(s.cost_service, svcRow.cost ?? 0),
      service_name: svcRow.name,
      service_cost_catalog: num(svcRow.cost, 0),
    });
  }
  return out;
}

async function normalizeWorkersPayload(arr = []) {
  const out = [];
  const seen = new Set(); // 👈 evitar repetidos por worker_id

  for (const w of Array.isArray(arr) ? arr : []) {
    if (!w) continue;

    const rawId = w.worker_id ?? w.id;
    if (rawId == null) continue;

    const id = Number(rawId);
    if (!Number.isFinite(id)) continue;

    const exists = await prisma.workers.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });
    if (!exists) throw new Error(`Trabajador id=${id} no existe o está inactivo`);

    if (seen.has(id)) continue; // 👈 evita duplicados
    seen.add(id);

    out.push({ worker_id: id, cost_labor: num(w.cost_labor, 0) });
  }
  return out;
}


async function attachServicesWithCosts(tx, processId, services) {
  if (!services.length) return;
  await tx.process_service.createMany({
    data: services.map((s) => ({
      process_id: processId,
      service_id: s.service_id,
      cost_service: num(s.cost_service, 0),
    })),
    skipDuplicates: true, // 👈 requiere índice único compuesto
  });
}

async function attachWorkersWithCosts(tx, processId, workers) {
  if (!workers.length) return;
  await tx.process_worker.createMany({
    data: workers.map((w) => ({
      process_id: processId,
      worker_id: w.worker_id,
      cost_labor: num(w.cost_labor, 0),
    })),
    skipDuplicates: true, // 👈 requiere índice único compuesto
  });
}


async function recomputeCostTotal(processId, tx = prisma) {
  const proc = await tx.processes.findUnique({
    where: { id: processId },
    include: { products: true },
  });
  if (!proc) return 0;

  const quantity = num(proc.quantity, 1);
  const product = proc.products ?? {};

  const productTotalCost = num(product.total_cost ?? product.totalCost, NaN);
  const productPrice = num(product.price, NaN);
  const materiales = Number.isFinite(productTotalCost)
    ? productTotalCost
    : Number.isFinite(productPrice)
    ? productPrice * quantity
    : 0;

  const [svcAgg, wkrAgg] = await Promise.all([
    tx.process_service.aggregate({
      where: { process_id: processId, deleted_at: null },
      _sum: { cost_service: true },
    }),
    tx.process_worker.aggregate({
      where: { process_id: processId, deleted_at: null },
      _sum: { cost_labor: true },
    }),
  ]);
  const servicesTotal = num(svcAgg?._sum?.cost_service, 0);
  const laborTotal = num(wkrAgg?._sum?.cost_labor, 0);

  const cost_total = materiales + servicesTotal + laborTotal;

  await tx.processes.update({
    where: { id: processId },
    data: { cost_total },
  });

  return cost_total;
}

async function loadProcessDTO(processId) {
  const p = await prisma.processes.findUnique({
    where: { id: processId },
    include: {
      process_service: {
        where: { deleted_at: null },
        include: { services: { select: { id: true, name: true, cost: true } } },
      },
      process_worker: {
        where: { deleted_at: null },
        include: { workers: { select: { id: true, firstname: true, lastname: true } } },
      },
      products: true,
    },
  });
  if (!p) return null;

  return {
    ...p,
    process_service: (p.process_service ?? []).map((ps) => ({
      id: ps.id,
      service_id: ps.service_id,
      name: ps.services?.name ?? "",
      cost: num(ps.services?.cost, 0),
      cost_service: num(ps.cost_service, 0),
    })),
    process_worker: (p.process_worker ?? []).map((pw) => ({
      id: pw.id,
      worker_id: pw.worker_id,
      name: `${pw.workers?.firstname ?? ""} ${pw.workers?.lastname ?? ""}`.trim(),
      cost_labor: num(pw.cost_labor, 0),
    })),
  };
}

export default class ProcessesController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.processes.findMany({
        where: { deleted_at: null },
        include: {
          process_service: {
            where: { deleted_at: null },
            include: { services: { select: { id: true, name: true, cost: true } } },
          },
          process_worker: {
            where: { deleted_at: null },
            include: { workers: { select: { id: true, firstname: true, lastname: true } } },
          },
          products: true,
        },
      });

      const data = rows.map((p) => ({
        ...p,
        process_service: (p.process_service ?? []).map((ps) => ({
          id: ps.id,
          service_id: ps.service_id,
          name: ps.services?.name ?? "",
          cost: num(ps.services?.cost, 0),
          cost_service: num(ps.cost_service, 0),
        })),
        process_worker: (p.process_worker ?? []).map((pw) => ({
          id: pw.id,
          worker_id: pw.worker_id,
          name: `${pw.workers?.firstname ?? ""} ${pw.workers?.lastname ?? ""}`.trim(),
          cost_labor: num(pw.cost_labor, 0),
        })),
      }));

      res.json({ ok: true, data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, msg: "Server error, something went wrong" });
    }
  }

  static async getById(req, res) {
    const processId = Number(req.params.id);
    if (!Number.isFinite(processId)) {
      return res.status(400).json({ ok: false, msg: "El id del proceso debe ser un numero" });
    }

    try {
      const data = await loadProcessDTO(processId);
      if (!data || data.deleted_at) {
        return res.status(404).json({ ok: false, msg: `No se encontro el proceso con id: ${processId}` });
      }
      res.json({ ok: true, data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ ok: false, msg: "Server Error, something went wrong" });
    }
  }

  static async create(req, res) {
    const {
      name,
      company_id,
      product_id,
      quantity,
      duration_total_minutes,
      services,
      workers,
      process_service,
      process_worker,
    } = req.body;

    const productId = Number(product_id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ ok: false, msg: "El id del producto debe ser un numero" });
    }

    const product = await prisma.products.findUnique({ where: { id: productId } });
    if (!product) return res.status(400).json({ ok: false, msg: "El producto especificado no existe" });

    const companyId = Number(company_id ?? product.company_id);
    if (!Number.isFinite(companyId)) {
      return res.status(400).json({ ok: false, msg: "El id de la empresa debe ser un numero" });
    }

    const company = await prisma.companies.findUnique({ where: { id: companyId } });
    if (!company) {
      return res.status(400).json({ ok: false, msg: "La empresa especificada no existe o fue dada de baja" });
    }

    try {
      const svcInput = Array.isArray(process_service) ? process_service : services;
      const wkrInput = Array.isArray(process_worker) ? process_worker : workers;

      const svcNorm = await normalizeServicesPayload(svcInput);
      const wkrNorm = await normalizeWorkersPayload(wkrInput);

      const processId = await prisma.$transaction(async (tx) => {
        const proc = await tx.processes.create({
          data: {
            name,
            quantity: quantity ?? 0,
            product_id: productId,
            company_id: companyId,
            duration_total_minutes: num(duration_total_minutes, 0),
            cost_total: 0, 
          },
        });

        await attachServicesWithCosts(tx, proc.id, svcNorm);
        await attachWorkersWithCosts(tx, proc.id, wkrNorm);

        await recomputeCostTotal(proc.id, tx);

        return proc.id;
      });

      const data = await loadProcessDTO(processId);
      res.status(201).json({ ok: true, msg: "Proceso creado correctamente", data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, msg: "Server error something went wrong" });
    }
  }

static async update(req, res) {
  const processId = Number(req.params.id);
  if (!Number.isFinite(processId)) {
    return res.status(400).json({ ok: false, msg: "El id del proceso debe ser un numero" });
  }

  const toNum = (v, def = 0) => {
    const n = Number(String(v ?? "").replace(",", ".").trim());
    return Number.isFinite(n) ? n : def;
  };
  const toPosIntOr = (v, def) => {
    const n = parseInt(String(v ?? "").trim(), 10);
    return Number.isFinite(n) && n >= 0 ? n : def;
  };
  const toArray = (v) => (Array.isArray(v) ? v : []);

  const {
    name,
    quantity,
    product_id,
    duration_total_minutes,
    services,
    workers,
    process_service,
    process_worker,
  } = req.body ?? {};

  const quantitySafe = quantity === undefined ? undefined : toPosIntOr(quantity, undefined);
  const durationSafe =
    duration_total_minutes === undefined ? undefined : toPosIntOr(duration_total_minutes, undefined);

  const svcInput = Array.isArray(process_service) ? process_service : toArray(services);
  const wkrInput = Array.isArray(process_worker) ? process_worker : toArray(workers);

  const old = await prisma.processes.findUnique({ where: { id: processId } });
  if (!old || old.deleted_at) {
    return res.status(404).json({ ok: false, msg: "No se encontro el proceso que se desea modificar" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      let newProductId = old.product_id;
      if (product_id !== undefined && product_id !== null && String(product_id).trim() !== "") {
        const pid = Number(String(product_id).trim());
        if (!Number.isFinite(pid)) throw new Error("El id del producto debe ser un numero");
        const prod = await tx.products.findUnique({ where: { id: pid } });
        if (!prod) throw new Error("El producto especificado no existe");
        newProductId = pid;
      }

      const updated = await tx.processes.update({
        where: { id: processId },
        data: {
          name: name ?? old.name,
          product_id: newProductId,
          quantity: quantitySafe !== undefined ? quantitySafe : old.quantity,
          duration_total_minutes:
            durationSafe !== undefined ? durationSafe : (old.duration_total_minutes ?? 0),
        },
      });

      if (svcInput.length) {
        const svcNorm = await normalizeServicesPayload(svcInput);
        await tx.process_service.deleteMany({ where: { process_id: processId } });
        await attachServicesWithCosts(tx, processId, svcNorm);
      } else if (process_service !== undefined || services !== undefined) {
        await tx.process_service.deleteMany({ where: { process_id: processId } });
      }

      if (wkrInput.length) {
        const wkrNorm = await normalizeWorkersPayload(wkrInput);
        await tx.process_worker.deleteMany({ where: { process_id: processId } });
        await attachWorkersWithCosts(tx, processId, wkrNorm);
      } else if (process_worker !== undefined || workers !== undefined) {
        await tx.process_worker.deleteMany({ where: { process_id: processId } });
      }

      await recomputeCostTotal(updated.id, tx);
    });

    const data = await loadProcessDTO(processId);
    return res.json({ ok: true, msg: "Proceso actualizado correctamente", data });
  } catch (error) {
    console.error("[process.update] ERROR:", error);
    return res.status(500).json({
      ok: false,
      msg: "Server error something went wrong",
      detail: error?.message ?? String(error),
    });
  }
}


  static async delete(req, res) {
    const processId = Number(req.params.id);
    if (!Number.isFinite(processId)) {
      return res.status(400).json({ ok: false, msg: "El id del proceso debe ser un numero" });
    }

    const exists = await prisma.processes.findUnique({ where: { id: processId } });
    if (!exists) {
      return res.status(404).json({ ok: false, msg: "No se encontro el proceso que se desea eliminar" });
    }

    try {
      const { id: inactiveId } = await prisma.processes.update({
        where: { id: processId },
        data: { deleted_at: new Date() },
      });

      res.json({ ok: true, msg: "Se elimino el proceso correctamente", id: inactiveId });
    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, msg: "Server error something went wrong" });
    }
  }
}
