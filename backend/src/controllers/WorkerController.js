import prisma from "../database.js";
import TagController from "./TagController.js";

export default class WorkerController {

  static async getAll(req, res) {
    try {
      let workers = await prisma.workers.findMany({
        where: { deleted_at: null },
        include: {
          departments: {
            select: { name: true }
          }
        }
      });

      workers = workers.map(wk => {
        return {
          ...wk,
          departments: wk.departments?.name ?? null
        };
      });

      res.json({
        ok: true,
        data: workers
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

    const workerId = parseInt(id);

    if (isNaN(workerId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de trabajador debe ser un numero"
      });
    }

    let worker;

    try {
      worker = await prisma.workers.findFirst({
        where: {
          AND: [{ id: workerId }, { deleted_at: null }]
        },
        include: {
          departments: {
            select: { name: true }
          }
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: "Server Error, something went wrong"
      });
    }

    if (worker === null) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontro el trabajador con id: ${workerId}`
      });
    }

    worker = {
      ...worker,
      departments: worker.departments?.name ?? null
    };

    res.json({
      ok: true,
      data: worker
    });
  }

  static async create(req, res) {
    const {
      firstname,
      lastname,
      hourly_fee,
      department_id
    } = req.body;

    const departmentId = parseInt(department_id);

    if (isNaN(departmentId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del departamento debe ser un numero"
      });
    }

    if (hourly_fee === undefined || Number(hourly_fee) <= 0) {
      return res.status(400).json({
        ok: false,
        msg: "La tarifa por hora debe ser mayor que 0"
      });
    }

    if (!await prisma.departments.findFirst({ where: { AND: [{ id: departmentId }, { deleted_at: null }] } })) {
      return res.status(400).json({
        ok: false,
        msg: "El departamento especificado no existe o fue dado de baja"
      });
    }

    try {
      let worker = await prisma.workers.create({
        data: {
          firstname,
          lastname,
          hourly_fee,
          department_id: departmentId
        }
      });

      worker = await prisma.workers.findUnique({
        where: { id: worker.id },
        include: {
          departments: { select: { name: true } }
        }
      });

      worker = {
        ...worker,
        departments: worker.departments?.name ?? null
      };

      res.status(201).json({
        ok: true,
        msg: "Trabajador creado correctamente",
        data: worker
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
    const { id } = req.params;
    const {
      firstname,
      lastname,
      hourly_fee,
      department_id
    } = req.body;

    const workerId = parseInt(id);

    if (isNaN(workerId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de trabajador debe ser un numero"
      });
    }

    const oldWorker = await prisma.workers.findUnique({ where: { id: workerId } });
    if (!oldWorker || oldWorker.deleted_at !== null) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el trabajador que se desea modificar"
      });
    }

    let departmentId = null;

    if (department_id !== undefined) {
      departmentId = parseInt(department_id);

      if (isNaN(departmentId)) {
        return res.status(400).json({
          ok: false,
          msg: "El id del departamento debe ser un numero"
        });
      }

      if (!await prisma.departments.findFirst({ where: { AND: [{ id: departmentId }, { deleted_at: null }] } })) {
        return res.status(400).json({
          ok: false,
          msg: "El departamento especificado no existe o fue dado de baja"
        });
      }
    }

    if (hourly_fee !== undefined && Number(hourly_fee) <= 0) {
      return res.status(400).json({
        ok: false,
        msg: "La tarifa por hora debe ser mayor que 0"
      });
    }

    try {
      let worker = await prisma.workers.update({
        where: { id: workerId },
        data: {
          name: undefined,
          firstname: firstname ?? oldWorker.firstname,
          lastname:  lastname  ?? oldWorker.lastname,
          hourly_fee: hourly_fee ?? oldWorker.hourly_fee,
          department_id: departmentId ?? oldWorker.department_id
        }
      });

      worker = await prisma.workers.findUnique({
        where: { id: worker.id },
        include: {
          departments: { select: { name: true } }
        }
      });

      worker = {
        ...worker,
        departments: worker.departments?.name ?? null
      };

      res.json({
        ok: true,
        msg: "Trabajador actualizado correctamente",
        data: worker
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong"
      });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;

    const workerId = parseInt(id);

    if (isNaN(workerId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de trabajador debe ser un numero"
      });
    }

    if (!await prisma.workers.findFirst({ where: { AND: [{ id: workerId }, { deleted_at: null }] } })) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el trabajador que se desea eliminar"
      });
    }

    try {
      const { id: inactiveId } = await prisma.workers.update({
        where: { id: workerId },
        data: { deleted_at: new Date() }
      });

      res.json({
        ok: true,
        msg: "Se elimino el trabajador correctamente",
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
