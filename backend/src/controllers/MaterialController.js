import prisma from "../database.js";

export default class MaterialController {

  static async getAll(req, res) {

    const materials = await prisma.materials.findMany();

    res.json(materials);
  }

}
