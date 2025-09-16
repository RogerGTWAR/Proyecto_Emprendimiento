import { Prisma } from "@prisma/client";
import prisma from "../database.js";

export default class ProductController {

  static async getAll(req, res) {

    try {
      const products = await prisma.products.findMany({
        where: { deleted_at: null }
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
        }
      });

    } catch (error) {
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
      product_img,
      company_id,
      materials
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

      const product = await prisma.products.create({
        data: {
          name,
          description,
          estimated_time,
          profit_margin,
          product_img: product_img ?? 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg',
          company_id: companyId
        }
      });

      if (materials && materials.length > 0) {
        await prisma.product_material.createMany({
          data: materials.map(({ materialId, quantity }) => ({
            product_id: product.id,
            material_id: materialId,
            quantity
          })),
        });
      }

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
      product_img,
      materials
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
      const product = await prisma.products.update(
        {
          where: { id: productId },
          data: {
            name: name ?? oldProduct.name,
            description: description ?? oldProduct.description,
            estimated_time: estimated_time ?? oldProduct.estimated_time,
            profit_margin: profit_margin ?? oldProduct.profit_margin,
            product_img: product_img ?? oldProduct.product_img
          }
        },
      );

      const pastMaterials = (await prisma.product_material.findMany({
        where: {
          product_id: oldProduct.id
        }
      })).map(pt => pt.material_id);

      const newMaterials = materials.map(mt => mt.materialId);

      if (materials) {

        const materialsToAdd = materials.map(({ materialId, quantity }) => {

          if (!pastMaterials.includes(materialId)) {

            const product_material = {
              product_id: product.id,
              material_id: materialId,
              quantity
            };

            return product_material;
          }
        }).filter(mt => mt !== null && mt !== undefined)

        if (materialsToAdd.length > 0) {
          await prisma.product_material.createMany({
            data: materialsToAdd,
          })
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

