import prisma from "../database.js";

export default class ProcessesController {

  static async getAll(req, res) {
    try {
      let processes = await prisma.processes.findMany({
        where: { deleted_at: null },
        include: {
          process_service: { include: { services: { select: { name: true } } } },
          process_worker:  { include: { workers:  { select: { firstname: true, lastname: true } } } }
        }
      });

      processes = processes.map(p => ({
        ...p,
        process_service: (p.process_service ?? [])
          .map(ps => ps?.services?.name)
          .filter(Boolean),
        process_worker: (p.process_worker ?? [])
          .map(pw => `${pw?.workers?.firstname ?? ""} ${pw?.workers?.lastname ?? ""}`.trim())
          .filter(Boolean)
      }));

      res.json({ ok: true, data: processes });
    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, msg: "Server error, something went wrong" });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    const processId = parseInt(id);

    if (isNaN(processId)) {
      return res.status(400).json({ ok: false, msg: "El id del proceso debe ser un numero" });
    }

    try {
      let process = await prisma.processes.findFirst({
        where: { AND: [{ id: processId }, { deleted_at: null }] },
        include: {
          process_service: { include: { services: { select: { name: true } } } },
          process_worker:  { include: { workers:  { select: { firstname: true, lastname: true } } } }
        }
      });

      if (!process) {
        return res.status(404).json({ ok: false, msg: `No se encontro el proceso con id: ${processId}` });
      }

      process = {
        ...process,
        process_service: (process.process_service ?? [])
          .map(ps => ps?.services?.name)
          .filter(Boolean),
        process_worker: (process.process_worker ?? [])
          .map(pw => `${pw?.workers?.firstname ?? ""} ${pw?.workers?.lastname ?? ""}`.trim())
          .filter(Boolean)
      };

      res.json({ ok: true, data: process });

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
      services,
      workers,
      process_service, 
      process_worker  
    } = req.body;

    const companyId = parseInt(company_id);
    if (isNaN(companyId)) {
      return res.status(400).json({ ok: false, msg: "El id de la empresa debe ser un numero" });
    }
    const productId = parseInt(product_id);
    if (isNaN(productId)) {
      return res.status(400).json({ ok: false, msg: "El id del producto debe ser un numero" });
    }

    const company = await prisma.companies.findUnique({ where: { id: companyId } });
    if (!company) return res.status(400).json({ ok: false, msg: "La empresa especificada no existe o fue dada de baja" });

    const product = await prisma.products.findUnique({ where: { id: productId } });
    if (!product) return res.status(400).json({ ok: false, msg: "El producto especificado no existe" });

    try {
      let process = await prisma.processes.create({
        data: {
          name,
          quantity: quantity ?? 0,  
          product_id: productId,
          company_id: companyId
        }
      });

      const servicesFinal = await ProcessesController._resolveServicesArray(services, process_service);
      const workersFinal  = await ProcessesController._resolveWorkersArray(workers, process_worker);

      if (servicesFinal.length > 0) {
        const ok = await ProcessesController.attachServicesToProcess(servicesFinal, process.id);
        if (!ok) return res.status(400).json({ ok: false, msg: "Los servicios especificados son invalidos" });
      }
      if (workersFinal.length > 0) {
        const ok = await ProcessesController.attachWorkersToProcess(workersFinal, process.id);
        if (!ok) return res.status(400).json({ ok: false, msg: "Los trabajadores especificados son invalidos" });
      }

      process = await prisma.processes.findUnique({
        where: { id: process.id },
        include: {
          process_service: { include: { services: { select: { name: true } } } },
          process_worker:  { include: { workers:  { select: { firstname: true, lastname: true } } } }
        }
      });

      process = {
        ...process,
        process_service: (process.process_service ?? [])
          .map(ps => ps?.services?.name)
          .filter(Boolean),
        process_worker: (process.process_worker ?? [])
          .map(pw => `${pw?.workers?.firstname ?? ""} ${pw?.workers?.lastname ?? ""}`.trim())
          .filter(Boolean)
      };

      res.status(201).json({ ok: true, msg: "Proceso creado correctamente", data: process });

    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, msg: "Server error something went wrong" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const {
      name,
      quantity,
      product_id,
      services,
      workers,
      process_service, 
      process_worker  
    } = req.body;

    const processId = parseInt(id);
    if (isNaN(processId)) {
      return res.status(400).json({ ok: false, msg: "El id del proceso debe ser un numero" });
    }

    const oldProcess = await prisma.processes.findUnique({ where: { id: processId } });
    if (!oldProcess || oldProcess.deleted_at) {
      return res.status(404).json({ ok: false, msg: "No se encontro el proceso que se desea modificar" });
    }

    let newProductId = oldProcess.product_id;
    if (product_id !== undefined) {
      const pid = parseInt(product_id);
      if (isNaN(pid)) return res.status(400).json({ ok: false, msg: "El id del producto debe ser un numero" });
      const prod = await prisma.products.findUnique({ where: { id: pid } });
      if (!prod) return res.status(400).json({ ok: false, msg: "El producto especificado no existe" });
      newProductId = pid;
    }

    try {
      await prisma.processes.update({
        where: { id: processId },
        data: {
          name: name ?? oldProcess.name,
          quantity: (quantity !== undefined ? quantity : oldProcess.quantity),
          product_id: newProductId
        }
      });

      const hasSvcPayload = Array.isArray(services) || Array.isArray(process_service);
      const hasWkrPayload = Array.isArray(workers)  || Array.isArray(process_worker);

      if (hasSvcPayload) {
        const svcFinal = await ProcessesController._resolveServicesArray(services, process_service);
        await ProcessesController.replaceServices(processId, svcFinal);
      }
      if (hasWkrPayload) {
        const wkrFinal = await ProcessesController._resolveWorkersArray(workers, process_worker);
        await ProcessesController.replaceWorkers(processId, wkrFinal);
      }

      let process = await prisma.processes.findUnique({
        where: { id: processId },
        include: {
          process_service: { include: { services: { select: { name: true } } } },
          process_worker:  { include: { workers:  { select: { firstname: true, lastname: true } } } }
        }
      });

      process = {
        ...process,
        process_service: (process.process_service ?? [])
          .map(ps => ps?.services?.name)
          .filter(Boolean),
        process_worker: (process.process_worker ?? [])
          .map(pw => `${pw?.workers?.firstname ?? ""} ${pw?.workers?.lastname ?? ""}`.trim())
          .filter(Boolean)
      };

      res.json({ ok: true, msg: "Proceso actualizado correctamente", data: process });

    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, msg: "Server error something went wrong" });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    const processId = parseInt(id);

    if (isNaN(processId)) {
      return res.status(400).json({ ok: false, msg: "El id del proceso debe ser un numero" });
    }

    if (!await prisma.processes.findUnique({ where: { id: processId } })) {
      return res.status(404).json({ ok: false, msg: "No se encontro el proceso que se desea eliminar" });
    }

    try {
      const { id: inactiveId } = await prisma.processes.update({
        where: { id: processId },
        data: { deleted_at: new Date() }
      });

      res.json({ ok: true, msg: "Se elimino el proceso correctamente", id: inactiveId });
    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, msg: "Server error something went wrong" });
    }
  }

  static async _resolveServicesArray(services, process_service) {
    let svc = Array.isArray(services) ? services.filter(s => s && s.id != null) : [];

    if (Array.isArray(process_service) && process_service.length > 0) {
      const names = process_service.map(n => String(n).trim()).filter(Boolean);

      const rows = await prisma.services.findMany({
        where: {
          AND: [
            { deleted_at: null },
            { OR: names.map(n => ({ name: { equals: n, mode: 'insensitive' } })) }
          ]
        },
        select: { id: true, name: true }
      });

      const found = new Set(rows.map(r => r.name.toLowerCase()));
      const missing = names.filter(n => !found.has(n.toLowerCase()));
      if (missing.length > 0) throw new Error(`Servicios no encontrados o inactivos: ${missing.join(', ')}`);

      svc = [...svc, ...rows.map(r => ({ id: r.id }))];
    }

    return svc
      .map(s => ({ id: parseInt(s.id) }))
      .filter(s => !isNaN(s.id));
  }

  static async _resolveWorkersArray(workers, process_worker) {
    let wk = Array.isArray(workers) ? workers.filter(w => w && w.id != null) : [];

    if (Array.isArray(process_worker) && process_worker.length > 0) {
      const pairs = process_worker.map(full => {
        const [f, ...rest] = String(full).trim().split(/\s+/);
        return { firstname: f, lastname: rest.join(" ") };
      });

      const rows = await prisma.workers.findMany({
        where: {
          AND: [
            { deleted_at: null },
            {
              OR: pairs.map(n => ({
                AND: [
                  { firstname: { equals: n.firstname, mode: 'insensitive' } },
                  { lastname:  { equals: n.lastname,  mode: 'insensitive' } }
                ]
              }))
            }
          ]
        },
        select: { id: true, firstname: true, lastname: true }
      });

      const requested = new Set(pairs.map(p => (p.firstname + ' ' + p.lastname).toLowerCase()));
      const found = new Set(rows.map(r => (r.firstname + ' ' + r.lastname).toLowerCase()));
      const missing = [...requested].filter(x => !found.has(x));
      if (missing.length > 0) throw new Error(`Trabajadores no encontrados o inactivos: ${missing.join(', ')}`);

      wk = [...wk, ...rows.map(r => ({ id: r.id }))];
    }

    return wk
      .map(w => ({ id: parseInt(w.id) }))
      .filter(w => !isNaN(w.id));
  }

  static async attachServicesToProcess(services, processId) {
    const ids = services.map(s => s.id);
    const real = await prisma.services.findMany({ where: { id: { in: ids } } });
    if (real.length < ids.length) return false;

    const data = ids.map(id => ({ process_id: processId, service_id: id }));

    try {
      await prisma.process_service.createMany({ data });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  static async attachWorkersToProcess(workers, processId) {
    const ids = workers.map(w => w.id);
    const real = await prisma.workers.findMany({ where: { id: { in: ids } } });
    if (real.length < ids.length) return false;

    const data = ids.map(id => ({ process_id: processId, worker_id: id }));

    try {
      await prisma.process_worker.createMany({ data });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  static async replaceServices(processId, services) {
    const ids = services.map(s => parseInt(s.id)).filter(n => !isNaN(n));

    await prisma.process_service.deleteMany({ where: { process_id: processId } });

    if (ids.length > 0) {
      await prisma.process_service.createMany({
        data: ids.map(id => ({ process_id: processId, service_id: id }))
      });
    }
  }

  static async replaceWorkers(processId, workers) {
    const ids = workers.map(w => parseInt(w.id)).filter(n => !isNaN(n));

    await prisma.process_worker.deleteMany({ where: { process_id: processId } });

    if (ids.length > 0) {
      await prisma.process_worker.createMany({
        data: ids.map(id => ({ process_id: processId, worker_id: id }))
      });
    }
  }
}
