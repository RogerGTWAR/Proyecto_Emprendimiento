import prisma from "../database.js";

export default class MaterialController {

  static async getAll(req, res) {

    const materials = await prisma.materials.findMany();

    res.json({
      ok: true,
      data: materials
    });
  }

  static async getById(req, res) {

    const { id } = req.params;

    const materialId = parseInt(id);

    if (isNaN(materialId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de material debe ser un numero"
      })
    }

    const material = await prisma.materials.findUnique({
      where: { id: materialId }
    });

    if (material === null) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontro el material con id: ${materialId}`
      })
    }

    res.json({
      ok: true,
      data: material
    });
  }

}
