import prisma from "../database.js";

export default class CompanyController {

  static async getAll(req, res) {
    try {
      let companies = await prisma.companies.findMany({
        where: { deleted_at: null },
        include: {
          users: { select: { email: true } }
        }
      });

      companies = companies.map(c => ({
        ...c,
        users: c.users?.email ?? null
      }));

      res.json({ ok: true, data: companies });
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
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de la empresa debe ser un numero"
      });
    }

    let company;

    try {
      company = await prisma.companies.findFirst({
        where: {
          AND: [{ id: companyId }, { deleted_at: null }]
        },
        include: {
          users: { select: { email: true } }
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: "Server Error, something went wrong"
      });
    }

    if (company === null) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontro la empresa con id: ${companyId}`
      });
    }

    company = {
      ...company,
      users: company.users?.email ?? null
    };

    res.json({ ok: true, data: company });
  }

  static async create(req, res) {
    const { name, type, user_id } = req.body;

    const userId = parseInt(user_id);

    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El nombre de la empresa es requerido"
      });
    }

    if (!type || String(type).trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El tipo de la empresa es requerido"
      });
    }

    if (isNaN(userId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del usuario debe ser un numero"
      });
    }

    if (
      !await prisma.users.findFirst({
        where: { AND: [{ id: userId }, { deleted_at: null }] }
      })
    ) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario especificado no existe o fue dado de baja"
      });
    }

    try {
      let company = await prisma.companies.create({
        data: {
          name: String(name).trim(),
          type: String(type).trim(),
          user_id: userId
        }
      });

      company = await prisma.companies.findUnique({
        where: { id: company.id },
        include: { users: { select: { email: true } } }
      });

      company = {
        ...company,
        users: company.users?.email ?? null
      };

      res.status(201).json({
        ok: true,
        msg: "Empresa creada correctamente",
        data: company
      });
    } catch (error) {
      console.log(error);
      // user_id es UNIQUE
      if (error.code === "P2002" && error.meta?.target?.includes("user_id")) {
        return res.status(409).json({
          ok: false,
          msg: "El usuario ya tiene una empresa asociada"
        });
      }
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong"
      });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const { name, type, user_id } = req.body;

    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de la empresa debe ser un numero"
      });
    }

    const oldCompany = await prisma.companies.findUnique({
      where: { id: companyId }
    });

    if (!oldCompany || oldCompany.deleted_at !== null) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro la empresa que se desea modificar"
      });
    }

    let newUserId = null;

    if (user_id !== undefined) {
      newUserId = parseInt(user_id);

      if (isNaN(newUserId)) {
        return res.status(400).json({
          ok: false,
          msg: "El id del usuario debe ser un numero"
        });
      }

      if (
        !await prisma.users.findFirst({
          where: { AND: [{ id: newUserId }, { deleted_at: null }] }
        })
      ) {
        return res.status(400).json({
          ok: false,
          msg: "El usuario especificado no existe o fue dado de baja"
        });
      }
    }

    if (name !== undefined && String(name).trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El nombre de la empresa no puede estar vacio"
      });
    }

    if (type !== undefined && String(type).trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El tipo de la empresa no puede estar vacio"
      });
    }

    try {
      let company = await prisma.companies.update({
        where: { id: companyId },
        data: {
          name: name !== undefined ? String(name).trim() : oldCompany.name,
          type: type !== undefined ? String(type).trim() : oldCompany.type,
          user_id: newUserId ?? oldCompany.user_id
        }
      });

      company = await prisma.companies.findUnique({
        where: { id: company.id },
        include: { users: { select: { email: true } } }
      });

      company = {
        ...company,
        users: company.users?.email ?? null
      };

      res.json({
        ok: true,
        msg: "Empresa actualizada correctamente",
        data: company
      });
    } catch (error) {
      console.log(error);
      if (error.code === "P2002" && error.meta?.target?.includes("user_id")) {
        return res.status(409).json({
          ok: false,
          msg: "El usuario ya tiene una empresa asociada"
        });
      }
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong"
      });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    const companyId = parseInt(id);

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
      return res.status(404).json({
        ok: false,
        msg: "No se encontro la empresa que se desea eliminar"
      });
    }

    try {
      const { id: inactiveId } = await prisma.companies.update({
        where: { id: companyId },
        data: { deleted_at: new Date() }
      });

      res.json({
        ok: true,
        msg: "Se elimino la empresa correctamente",
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

//Tengo un error con el id, se incrementa de 2 en 2.