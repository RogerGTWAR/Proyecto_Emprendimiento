import prisma from "../database.js";
import TagController from "./TagController.js";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export default class MaterialController {

  static async getAll(req, res) {

    try {
      let materials = await prisma.materials.findMany({
        where: { deleted_at: null },
        include: {
          material_tag: {
            include: {
              tags: {
                select: { name: true }
              }
            }
          },
          material_units: {
            select: { unit_name: true }
          }
        }
      });

      materials = materials.map(mt => {
        return {
          ...mt,
          material_tag: mt.material_tag.map(m_t => m_t.tags.name),
          material_units: mt.material_units.unit_name
        };
      })

      res.json({
        ok: true,
        data: materials
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

    const materialId = parseInt(id);

    if (isNaN(materialId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de material debe ser un numero"
      })
    }

    let material;

    try {

      material = await prisma.materials.findFirst({
        where: {
          AND: [{ id: materialId }, { deleted_at: null }]
        },
        include: {
          material_tag: {
            include: {
              tags: {
                select: { name: true }
              }
            }
          },
          material_units: {
            select: { unit_name: true }
          }
        }
      });

    } catch (error) {
      console.log(error);
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

    material = {
      ...material,
      material_tag: material.material_tag.map(m_t => m_t.tags.name),
      material_units: material.material_units.unit_name
    };

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
      tags
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

      const file = req.file;
      let newName = null;

      if (file) {
        const ext = path.extname(file.originalname);
        newName = crypto.randomUUID() + ext;

        await fs.writeFile(`./public/uploads/material_images/${newName}`, file.buffer);
      }

      let material = await prisma.materials.create({
        data: {
          name,
          description,
          unit_cost,
          waste_percentage,
          material_unit_id: unitMaterialId,
          material_img: (newName ? `http://localhost:3000/uploads/material_images/${newName}` : null) ?? 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
          company_id: companyId
        }
      });

      if (tags && tags.length > 0) {
        if (!await TagController.attachTagsToItem(tags, material.id, 'material')) {
          res.status(400).json({
            ok: false,
            msg: "Las tags especificadas son invalidas"
          })
        }
      }

      material = await prisma.materials.findUnique({
        where: {
          id: material.id
        },
        include: {
          material_tag: {
            include: {
              tags: {
                select: { name: true }
              }
            }
          },
          material_units: {
            select: { unit_name: true }
          }
        }
      });

      material = {
        ...material,
        material_tag: material.material_tag.map(m_t => m_t.tags.name),
        material_units: material.material_units.unit_name
      };
        newName = crypto.randomUUID() + ext;

      res.status(201).json({
        ok: true,
        msg: "Material creado correctamente",
        data: material
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
      name,
      description,
      waste_percentage,
      unit_cost,
      material_unit_id,
      tags
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

      const file = req.file;

      let newName = null;
      if (file) {
        const ext = path.extname(file.originalname);
        newName = crypto.randomUUID() + ext;

        await fs.writeFile(`./public/uploads/material_images/${newName}`, file.buffer)
      };


      let material = await prisma.materials.update(
        {
          where: { id: materialId },
          data: {
            name: name ?? oldMaterial.name,
            description: description ?? oldMaterial.description,
            waste_percentage: waste_percentage ?? oldMaterial.waste_percentage,
            material_img: (newName ? `http://localhost:3000/uploads/material_images/${newName}` : null) ?? oldMaterial.material_img,
            unit_cost: unit_cost ?? oldMaterial.unit_cost,
            material_unit_id: unitMaterialId ?? oldMaterial.material_unit_id
          }
        },
      );

      const pastTags = (await prisma.material_tag.findMany({
        where: {
          material_id: oldMaterial.id
        }
      })).map(mt => mt.tag_id);


      if (tags) {
        const tagsToAdd = tags.map(tagId => {

          if (!pastTags.includes(tagId)) {
            return tagId;
          }

        }).filter(mt => mt !== null && mt !== undefined)

        if (tagsToAdd.length > 0) {
          if (!await TagController.attachTagsToItem(tagsToAdd, material.id, 'material')) {
            return res.status(400).json({
              ok: false,
              msg: "Tags especificadas invalidas"
            });
          }
        };

        await prisma.material_tag.deleteMany({
          where: {
            AND: [
              { material_id: oldMaterial.id },
              {
                tag_id: {
                  in: pastTags.filter(tagId => {
                    return !tags.includes(tagId);
                  })
                }
              }
            ]
          }
        });
      }

      material = await prisma.materials.findUnique({
        where: {
          id: material.id
        },
        include: {
          material_tag: {
            include: {
              tags: {
                select: { name: true }
              }
            }
          },
          material_units: {
            select: { unit_name: true }
          }
        }
      });

      material = {
        ...material,
        material_tag: material.material_tag.map(m_t => m_t.tags.name),
        material_units: material.material_units.unit_name
      };

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

    try {
      const { id: inactiveId } = await prisma.materials.update(
        {
          where: { id: materialId },
          data: {
            deleted_at: new Date()
          }
        }
      );

      res.json({
        ok: true,
        msg: "Se elimino el material correctamente",
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

  static async attachMaterialsToProduct(materials, productId) {

    const realMaterials = await prisma.materials.findMany({
      where: {
        id: {
          in: materials.map(mt => mt.id)
        }
      }
    });

    if (realMaterials.length < 1) {
      return false;
    }

    const materialsToAdd = realMaterials.map(({ id }) => {

      const material = materials.find((mt) => mt.id === id);

      if (material) {
        return {
          product_id: productId,
          material_id: material.id,
          quantity: material.quantity
        }
      }
    });

    try {

      await prisma.product_material.createMany({
        data: materialsToAdd
      })

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}


