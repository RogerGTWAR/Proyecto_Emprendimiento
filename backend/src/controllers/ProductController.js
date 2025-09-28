import { Prisma } from "@prisma/client";
import prisma from "../database.js";
import TagController from "./TagController.js";
import MaterialController from "./MaterialController.js";
import crypto from "crypto";

export default class ProductController {

  static async getAll(req, res) {

    try {
      let products = await prisma.products.findMany({
        where: { deleted_at: null },
        include: {
          product_tag: {
            include: {
              tags: {
                select: { name: true }
              }
            }
          },
        }
      });

      products = products.map(p => {
        return {
          ...p,
          product_tag: p.product_tag.map(pt => pt.tags.name)
        };
      });

      res.json({
        ok: true,
        data: products
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

    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del producto debe ser un numero"
      });
    }

    let product;

    try {

      product = await prisma.products.findFirst({
        where: {
          AND: [{ id: productId }, { deleted_at: null }]
        },
        include: {
          product_tag: {
            include: {
              tags: {
                select: { name: true }
              }
            }
          },
          product_material: {
            select: {
              quantity: true,
              materials: {
                select: {
                  name: true,
                  material_img: true,
                  unit_cost: true,
                  waste_percentage: true,
                  material_tag: {
                    include: {
                      tags: {
                        select: { name: true }
                      }
                    }
                  },
                  material_units: {
                    select: { unit_name: true }
                  },
                },
              }
            }
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

    if (product === null) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontro el producto con id: ${productId}`
      })
    }

    product = {
      ...product,
      product_tag: product.product_tag.map(pt => pt.tags.name),
      product_material: product.product_material.map(pm => {

        const { materials } = pm;

        return {
          ...materials,
          material_tag: materials.material_tag.map(mt => mt.tags.name),
          material_units: materials.material_units.unit_name
        }
      })
    };

    res.json({
      ok: true,
      data: product
    });
  }

  static async create(req, res) {

    const {
      name,
      description,
      estimated_time,
      profit_margin,
      company_id,
      materials,
      tags
    } = req.body;

    const companyId = parseInt(company_id);

    if (isNaN(companyId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de la empresa debe ser un numero"
      });
    }

    if (!await prisma.companies.findUnique({ where: { id: companyId } })) {
      return res.status(400).json({
        ok: false,
        msg: "La empresa especificada no existe o fue dada de baja"
      });
    };

    try {
      const file = req.file;
      let newName = null;

      if (file) {
        const ext = path.extname(file.originalname);
        newName = crypto.randomUUID() + ext;

        await fs.writeFile(`./public/uploads/product_images/${newName}`, file.buffer);
      }

      let product = await prisma.products.create({
        data: {
          name,
          description,
          estimated_time,
          profit_margin,
          product_img: (newName ? `http://localhost:3000/uploads/product_images/${newName}` : null) ?? 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
          company_id: companyId
        }
      });

      if (materials && materials.length > 0) {
        if (!await MaterialController.attachMaterialsToProduct(materials, product.id)) {
          return res.status(400).json({
            ok: false,
            msg: "Los materiales especificados son invalidos"
          })
        }
      }

      if (tags && tags.length > 0) {
        if (!await TagController.attachTagsToItem(tags, product.id, 'product')) {
          res.status(400).json({
            ok: false,
            msg: "Las tags especificadas son invalidas"
          })
        }
      }

      product = await prisma.products.findFirst({
        where: {
          AND: [{ id: product.id }, { deleted_at: null }]
        },
        include: {
          product_tag: {
            include: {
              tags: {
                select: { name: true }
              }
            }
          },
          product_material: {
            select: {
              quantity: true,
              materials: {
                select: {
                  name: true,
                  material_img: true,
                  unit_cost: true,
                  waste_percentage: true,
                  material_tag: {
                    include: {
                      tags: {
                        select: { name: true }
                      }
                    }
                  },
                  material_units: {
                    select: { unit_name: true }
                  },
                },
              }
            }
          }

        }
      });


      product = {
        ...product,
        product_tag: product.product_tag.map(pt => pt.tags.name),
        product_material: product.product_material.map(pm => {

          const { materials } = pm;

          return {
            ...materials,
            material_tag: pm.materials.material_tag.map(mt => mt.tags.name),
            material_units: pm.materials.material_units.unit_name
          }
        })
      };

      res.status(201).json({
        ok: true,
        msg: "Producto creado correctamente",
        data: product
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
      estimated_time,
      profit_margin,
      materials,
      tags
    } = req.body;

    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de producto debe ser un numero"
      });
    }

    const oldProduct = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!oldProduct) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el producto que se desea modificar"
      });
    }

    try {
      const file = req.file;
      let newName = null;

      if (file) {
        const ext = path.extname(file.originalname);
        newName = crypto.randomUUID() + ext;

        await fs.writeFile(`./public/uploads/product_images/${newName}`, file.buffer);
      }

      const product = await prisma.products.update(
        {
          where: { id: productId },
          data: {
            name: name ?? oldProduct.name,
            description: description ?? oldProduct.description,
            estimated_time: estimated_time ?? oldProduct.estimated_time,
            profit_margin: profit_margin ?? oldProduct.profit_margin,
            product_img: (newName ? `http://localhost:3000/uploads/product_images/${newName}` : null) ?? oldProduct.product_img
          }
        },
      );

      const pastMaterials = (await prisma.product_material.findMany({
        where: {
          product_id: oldProduct.id
        }
      })).map(pt => pt.material_id);

      const pastTags = (await prisma.product_tag.findMany({
        where: {
          product_id: oldProduct.id
        }
      })).map(pt => pt.tag_id);

      const newMaterials = materials.map(mt => mt.id);

      if (materials) {

        const materialsToAdd = materials.map(mt => {

          if (!pastMaterials.includes(mt.id)) {
            return mt;
          }

        }).filter(mt => mt !== null && mt !== undefined)

        if (materialsToAdd.length > 0) {
          if (!await MaterialController.attachMaterialsToProduct(materialsToAdd, product.id)) {
            return res.status(400).json({
              ok: false,
              msg: "Materiales especificados invalidos"
            });
          }
        };

        await prisma.product_material.deleteMany({
          where: {
            AND: [
              { product_id: oldProduct.id },
              {
                material_id: {
                  in: pastMaterials.filter(materialId => {
                    return !newMaterials.includes(materialId);
                  })
                }
              }
            ]
          }
        });

      }

      if (tags) {

        const tagsToAdd = tags.map(tagId => {

          if (!pastTags.includes(tagId)) {
            return tagId;
          }

        }).filter(mt => mt !== null && mt !== undefined)

        if (tagsToAdd.length > 0) {
          if (!await TagController.attachTagsToItem(tagsToAdd, product.id, 'product')) {
            return res.status(400).json({
              ok: false,
              msg: "Tags especificadas invalidas"
            });
          }
        };

        await prisma.product_tag.deleteMany({
          where: {
            AND: [
              { product_id: oldProduct.id },
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

      product = await prisma.products.findFirst({
        where: {
          AND: [{ id: product.id }, { deleted_at: null }]
        },
        include: {
          product_tag: {
            include: {
              tags: {
                select: { name: true }
              }
            }
          },
          product_material: {
            select: {
              quantity: true,
              materials: {
                select: {
                  name: true,
                  material_img: true,
                  unit_cost: true,
                  waste_percentage: true,
                  material_tag: {
                    include: {
                      tags: {
                        select: { name: true }
                      }
                    }
                  },
                  material_units: {
                    select: { unit_name: true }
                  },
                },
              }
            }
          }

        }
      });


      product = {
        ...product,
        product_tag: product.product_tag.map(pt => pt.tags.name),
        product_material: product.product_material.map(pm => {
          const { materials } = pm;

          return {
            ...materials,
            material_tag: pm.materials.material_tag.map(mt => mt.tags.name),
            material_units: pm.materials.material_units.unit_name
          }
        })
      };

      res.json({
        ok: true,
        msg: "Producto actualizado correctamente",
        data: product
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

    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id de producto debe ser un numero"
      });
    }

    if (!await prisma.products.findUnique({ where: { id: productId } })) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontro el producto que se desea eliminar"
      });
    }

    try {
      const { id: inactiveId } = await prisma.products.update(
        {
          where: { id: productId },
          data: {
            deleted_at: new Date()
          }
        }
      );

      res.json({
        ok: true,
        msg: "Se elimino el producto correctamente",
        id: inactiveId
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        msg: "Server error something went wrong",
      });
    }

  }
}

