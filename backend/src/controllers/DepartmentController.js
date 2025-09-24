import prisma from "../database.js";

export default class DepartmentController {

  static async getAll(req, res) {
    try {
      let departments = await prisma.departments.findMany({
        where: { deleted_at: null },
        include: {
          companies: { select: { name: true } }
        }
      });

      departments = departments.map(dep => ({
        ...dep,
        companies: dep.companies?.name ?? null
      }));

      res.json({ ok: true, data: departments });
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
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del departamento debe ser un numero"
      });
    }

    let department;

    try {
      department = await prisma.departments.findFirst({
        where: {
          AND: [{ id: departmentId }, { deleted_at: null }]
        },
        include: {
          companies: { select: { name: true } }
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: "Server Error, something went wrong"
      });
    }

    if (department === null) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontro el departamento con id: ${departmentId}`
      });
    }

    department = {
      ...department,
      companies: department.companies?.name ?? null
    };

    res.json({ ok: true, data: department });
  }

  static async create(req, res) {
    const { name, description, company_id } = req.body;

    const companyId = parseInt(company_id);

    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El nombre del departamento es requerido"
      });
    }

    if (isNaN(companyId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de la empresa debe ser un numero"
      });
    }

    if (
      !await prisma.companies.findFirst({
        where: { AND: [{ id: companyId }, { deleted_at: null }] }
      })
    ) {
      return res.status(400).json({
        ok: false,
        msg: "La empresa especificada no existe o fue dada de baja"
      });
    }

    try {
      let department = await prisma.departments.create({
        data: {
          name: String(name).trim(),
          description: description ?? null,
          company_id: companyId
        }
      });

      department = await prisma.departments.findUnique({
        where: { id: department.id },
        include: { companies: { select: { name: true } } }
      });

      department = {
        ...department,
        companies: department.companies?.name ?? null
      };

      res.status(201).json({
        ok: true,
        msg: "Departamento creado correctamente",
        data: department
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
    const { name, description, company_id } = req.body;

    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del departamento debe ser un numero"
      });
    }

    const oldDepartment = await prisma.departments.findUnique({
      where: { id: departmentId }
    });

    if (!oldDepartment || oldDepartment.deleted_at !== null) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el departamento que se desea modificar"
      });
    }

    let companyId = null;

    if (company_id !== undefined) {
      companyId = parseInt(company_id);

      if (isNaN(companyId)) {
        return res.status(400).json({
          ok: false,
          msg: "El id de la empresa debe ser un numero"
        });
      }

      if (
        !await prisma.companies.findFirst({
          where: { AND: [{ id: companyId }, { deleted_at: null }] }
        })
      ) {
        return res.status(400).json({
          ok: false,
          msg: "La empresa especificada no existe o fue dada de baja"
        });
      }
    }

    if (name !== undefined && String(name).trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El nombre del departamento no puede estar vacío"
      });
    }

    try {
      let department = await prisma.departments.update({
        where: { id: departmentId },
        data: {
          name: name !== undefined ? String(name).trim() : oldDepartment.name,
          description: description !== undefined ? description : oldDepartment.description,
          company_id: companyId ?? oldDepartment.company_id
        }
      });

      department = await prisma.departments.findUnique({
        where: { id: department.id },
        include: { companies: { select: { name: true } } }
      });

      department = {
        ...department,
        companies: department.companies?.name ?? null
      };

      res.json({
        ok: true,
        msg: "Departamento actualizado correctamente",
        data: department
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
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del departamento debe ser un numero"
      });
    }

    if (
      !await prisma.departments.findFirst({
        where: { AND: [{ id: departmentId }, { deleted_at: null }] }
      })
    ) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el departamento que se desea eliminar"
      });
    }

    try {
      const { id: inactiveId } = await prisma.departments.update({
        where: { id: departmentId },
        data: { deleted_at: new Date() }
      });

      res.json({
        ok: true,
        msg: "Se elimino el departamento correctamente",
        id: inactiveId
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong"
      });
    }
  }
}
