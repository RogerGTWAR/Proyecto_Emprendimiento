import { Prisma } from "@prisma/client";
import prisma from "../database.js";

export default class MaterialController {

  static async getAll(req, res) {

    try {
      const materials = await prisma.materials.findMany();

      res.json({
        ok: true,
        data: materials
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        msg: "Server error, something went wrong"
      });
    }

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

    let material;

    try {

      material = await prisma.materials.findUnique({
        where: { id: materialId }
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        msg: "Server Error, something went wrong"
      })
    }

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

  static async create(req, res) {

    const {
      name,
      description,
      waste_percentage,
      company_id,
      unit_cost,
      material_unit_id,
      material_img
    } = req.body;

    const companyId = parseInt(company_id);

    if (isNaN(companyId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de la empresa debe ser un numero"
      });
    }

    const unitMaterialId = parseInt(material_unit_id);

    if (isNaN(unitMaterialId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de la unidad de medida debe ser un numero"
      });
    }

    if (!await prisma.companies.findUnique({ where: { id: companyId } })) {
      return res.status(400).json({
        ok: false,
        msg: "La empresa especificada no existe o fue dada de baja"
      });
    };

    if (!await prisma.material_units.findFirst({ where: { id: unitMaterialId } })) {
      return res.status(400).json({
        ok: false,
        msg: "Se debe especificar una unidad de medida correcta"
      });
    }

    try {

      const material = await prisma.materials.create({
        data: {
          name,
          description,
          unit_cost,
          waste_percentage,
          material_unit_id: unitMaterialId,
          material_img: material_img ?? 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
          company_id: companyId
        }
      });

      res.status(201).json({
        ok: true,
        msg: "Material creado correctamente",
        data: material
      });

    } catch (error) {
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong"
      });
    }
  }

  static async update(req, res) {

    const { id } = req.params;
    const {
      name,
      description,
      waste_percentage,
      unit_cost,
      material_unit_id,
      material_img
    } = req.body;

    const materialId = parseInt(id);

    if (isNaN(materialId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de material debe ser un numero"
      });
    }

    const oldMaterial = await prisma.materials.findUnique({ where: { id: materialId } });

    if (!oldMaterial) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el material que se desea modificar"
      });
    }

    let unitMaterialId = null;

    if (material_unit_id) {
      unitMaterialId = parseInt(material_unit_id);

      if (isNaN(unitMaterialId)) {
        return res.status(400).json({
          ok: false,
          msg: "El id de la unidad de medida debe ser un numero"
        });
      }

      if (!await prisma.material_units.findFirst({ where: { id: unitMaterialId } })) {
        return res.status(400).json({
          ok: false,
          msg: "Se debe especificar una unidad de medida correcta"
        });
      }

    }

    try {
      const material = await prisma.materials.update(
        {
          where: { id: materialId },
          data: {
            name: name ?? oldMaterial.name,
            description: description ?? oldMaterial.description,
            waste_percentage: waste_percentage ?? oldMaterial.waste_percentage,
            material_img: material_img ?? oldMaterial.material_img,
            unit_cost: unit_cost ?? oldMaterial.unit_cost,
            material_unit_id: unitMaterialId ?? oldMaterial.material_unit_id
          }
        },
      );

      res.json({
        ok: true,
        msg: "Material actualizado correctamente",
        data: material
      });

    } catch (error) {
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong"
      });
    }
  }

  static async delete(req, res) {

    const { id } = req.params;

    const materialId = parseInt(id);

    if (isNaN(materialId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de material debe ser un numero"
      });
    }

    if (!await prisma.materials.findUnique({ where: { id: materialId } })) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el material que se desea eliminar"
      });
    }

    // TODO: Implement soft delete to avoid foreignkey constraints

    try {
      const { id: deletedId } = await prisma.materials.delete({ where: { id: materialId } });

      res.json({
        ok: true,
        msg: "Se elimino el material correctamente",
        id: deletedId
      });
    } catch (error) {
      res.json({
        ok: false,
        msg: "Server error something went wrong",
      });
    }

  }
}


