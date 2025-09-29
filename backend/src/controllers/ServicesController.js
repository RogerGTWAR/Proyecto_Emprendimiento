import prisma from "../database.js";

export default class ServicesController {

  static async getAll(req, res) {
    try {
      let services = await prisma.services.findMany({
        where: { deleted_at: null },
        orderBy: { id: "desc" }
      });

      res.json({
        ok: true,
        data: services
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "Server error, something went wrong"
      });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;

    const serviceId = parseInt(id);

    if (isNaN(serviceId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del servicio debe ser un numero"
      });
    }

    let service;

    try {
      service = await prisma.services.findFirst({
        where: {
          AND: [{ id: serviceId }, { deleted_at: null }]
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: "Server Error, something went wrong"
      });
    }

    if (service === null) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontro el servicio con id: ${serviceId}`
      });
    }

    res.json({
      ok: true,
      data: service
    });
  }

  static async create(req, res) {
    const { name, cost } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        ok: false,
        msg: "El nombre del servicio es requerido"
      });
    }

    if (cost === undefined || Number(cost) <= 0) {
      return res.status(400).json({
        ok: false,
        msg: "El costo debe ser mayor que 0"
      });
    }

    try {
      const service = await prisma.services.create({
        data: { name, cost }
      });

      res.status(201).json({
        ok: true,
        msg: "Servicio creado correctamente",
        data: service
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong"
      });
    }
  }

static async update(req, res) {
  // Normalizar id
  const rawId = req.params.id;
  const serviceId = Number(String(rawId ?? "").trim());

  if (!Number.isFinite(serviceId)) {
    return res.status(400).json({ ok: false, msg: "El id del servicio debe ser un numero" });
  }

  // Normalizadores
  const str = (v) => String(v ?? "").trim();
  const toNumOr = (v, def) => {
    const n = Number(String(v ?? "").replace(",", ".").trim());
    return Number.isFinite(n) ? n : def;
  };

  const { name, cost } = req.body ?? {};

  try {
    // Buscar solo activos
    const oldService = await prisma.services.findFirst({
      where: { id: serviceId, deleted_at: null },
    });

    if (!oldService) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontró un servicio activo con id=${serviceId}`,
      });
    }

    // Validaciones
    if (name !== undefined && str(name) === "") {
      return res.status(400).json({ ok: false, msg: "El nombre del servicio no puede estar vacío" });
    }

    if (cost !== undefined) {
      const costNum = toNumOr(cost, NaN);
      if (!Number.isFinite(costNum) || costNum <= 0) {
        return res.status(400).json({ ok: false, msg: "El costo debe ser un número mayor que 0" });
      }
    }

    const updated = await prisma.services.update({
      where: { id: serviceId },
      data: {
        name: name !== undefined ? str(name) : oldService.name,
        cost: cost !== undefined ? toNumOr(cost, oldService.cost) : oldService.cost,
      },
    });

    return res.json({
      ok: true,
      msg: "Servicio actualizado correctamente",
      data: updated,
    });
  } catch (error) {
    console.error("[services.update] ERROR", error);
    return res.status(500).json({ ok: false, msg: "Server error something went wrong" });
  }
}


  static async delete(req, res) {
    const { id } = req.params;

    const serviceId = parseInt(id);

    if (isNaN(serviceId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del servicio debe ser un numero"
      });
    }

    const exists = await prisma.services.findFirst({
      where: { AND: [{ id: serviceId }, { deleted_at: null }] }
    });

    if (!exists) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el servicio que se desea eliminar"
      });
    }

    try {
      const { id: inactiveId } = await prisma.services.update({
        where: { id: serviceId },
        data: { deleted_at: new Date() }
      });

      res.json({
        ok: true,
        msg: "Se elimino el servicio correctamente",
        id: inactiveId
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong",
      });
    }
  }
}
