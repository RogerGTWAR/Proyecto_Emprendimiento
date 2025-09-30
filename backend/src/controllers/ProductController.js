import prisma from "../database.js";
import TagController from "./TagController.js";
import MaterialController from "./MaterialController.js";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const toPosInt = (v) => {
  const n = Number.parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const toPosNumber = (v) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? n : null;
};
const toStr = (v) => (v === undefined || v === null ? null : String(v));

const normalizeTags = (tags) => {
  if (tags === undefined) return undefined;
  const arr = Array.isArray(tags) ? tags : [tags];
  return arr.map((t) => Number(t)).filter((t) => Number.isFinite(t));
};

const normalizeMaterials = (materials) => {
  if (materials === undefined || materials === null) return undefined;
  let arr = materials;
  if (typeof materials === "string") {
    try { arr = JSON.parse(materials); } catch { return undefined; }
  }
  if (!Array.isArray(arr)) return undefined;

  const norm = arr
    .map((m) => ({
      id: Number(m?.id),
      quantity: toPosInt(m?.quantity ?? m?.units ?? 1),
    }))
    .filter((m) => Number.isFinite(m.id) && Number.isFinite(m.quantity) && m.quantity > 0);

  return norm.length ? norm : [];
};

const FALLBACK_IMG =
  "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg";

async function computeMaterialRowCost(materialId, quantity) {
  const mat = await prisma.materials.findUnique({
    where: { id: materialId },
    select: { unit_cost: true, waste_percentage: true },
  });
  if (!mat) return 0;
  const unit = Number(mat.unit_cost) * (1 + Number(mat.waste_percentage || 0) / 100);
  return Number(unit) * Number(quantity);
}

async function recalcProductCosts(productId) {
  const rows = await prisma.product_material.findMany({
    where: { product_id: productId },
    select: { id: true, material_id: true, quantity: true },
  });

  let total = 0;
  for (const pm of rows) {
    const cost = await computeMaterialRowCost(pm.material_id, pm.quantity);
    total += cost;
    await prisma.product_material.update({
      where: { id: pm.id },
      data: { cost },
    });
  }

  await prisma.products.update({
    where: { id: productId },
    data: { total_cost: total },
  });

  return total;
}

export default class ProductController {
  static async getAll(req, res) {
    try {
      let products = await prisma.products.findMany({
        where: { deleted_at: null },
        include: {
          product_tag: { include: { tags: { select: { name: true } } } },
        },
      });

      products = products.map((p) => ({
        ...p,
        product_tag: p.product_tag.map((pt) => pt.tags.name),
      }));

      res.json({ ok: true, data: products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Server error, something went wrong" });
    }
  }

  static async getById(req, res) {
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ ok: false, msg: "El id del producto debe ser un numero" });
    }

    try {
      let product = await prisma.products.findFirst({
        where: { AND: [{ id: productId }, { deleted_at: null }] },
        include: {
          product_tag: { include: { tags: { select: { name: true } } } },
          product_material: {
            select: {
              id: true,
              quantity: true,
              cost: true, 
              materials: {
                select: {
                  id: true,
                  name: true,
                  material_img: true,
                  unit_cost: true,
                  waste_percentage: true,
                  material_tag: { include: { tags: { select: { name: true } } } },
                  material_units: { select: { unit_name: true } },
                },
              },
            },
          },
        },
      });

      if (!product) {
        return res.status(404).json({ ok: false, msg: `No se encontro el producto con id: ${productId}` });
      }

      product = {
        ...product,
        product_tag: product.product_tag.map((pt) => pt.tags.name),
        product_material: product.product_material.map((pm) => {
          const m = pm.materials;
          return {
            id: m.id,
            name: m.name,
            material_img: m.material_img,
            unit_cost: m.unit_cost,
            waste_percentage: m.waste_percentage,
            material_tag: m.material_tag.map((mt) => mt.tags.name),
            material_units: m.material_units.unit_name,
            quantity: pm.quantity,
            cost: pm.cost, 
          };
        }),
      };

      res.json({ ok: true, data: product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Server Error, something went wrong" });
    }
  }

  static async create(req, res) {
    let {
      name,
      description,
      estimated_time,
      profit_margin,
      product_img, 
      company_id,
      materials,    
      tags,
    } = req.body;

    const companyId = Number(company_id);
    if (!Number.isFinite(companyId)) {
      return res.status(400).json({ ok: false, msg: "El id de la empresa debe ser un numero" });
    }

    const estTime = toPosInt(estimated_time);
    if (estTime === null) {
      return res.status(400).json({ ok: false, msg: "estimated_time debe ser un entero > 0" });
    }

    const profit = toPosNumber(profit_margin);
    if (profit === null) {
      return res.status(400).json({ ok: false, msg: "profit_margin debe ser un numero > 0" });
    }

    const tagsNorm = normalizeTags(tags);
    const materialsNorm = normalizeMaterials(materials);
    const descStr = toStr(description);

    const existsCompany = await prisma.companies.findUnique({ where: { id: companyId } });
    if (!existsCompany) {
      return res.status(400).json({ ok: false, msg: "La empresa especificada no existe o fue dada de baja" });
    }

    try {
      let imgUrl = product_img && String(product_img).trim() ? String(product_img).trim() : null;
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const newName = `${crypto.randomUUID()}${ext}`;
        await fs.writeFile(`./public/uploads/product_images/${newName}`, req.file.buffer);
        imgUrl = `http://localhost:3000/uploads/product_images/${newName}`;
      }
      if (!imgUrl) imgUrl = FALLBACK_IMG;

      let product = await prisma.products.create({
        data: {
          name,
          description: descStr,
          estimated_time: estTime,
          profit_margin: profit,
          product_img: imgUrl,
          company_id: companyId,
          total_cost: 0,
        },
      });

      if (Array.isArray(materialsNorm) && materialsNorm.length > 0) {
        const ok = await MaterialController.attachMaterialsToProduct(materialsNorm, product.id);
        if (!ok) {
          return res.status(400).json({ ok: false, msg: "Los materiales especificados son invalidos" });
        }
      }

      await recalcProductCosts(product.id);

      if (Array.isArray(tagsNorm) && tagsNorm.length > 0) {
        const ok = await TagController.attachTagsToItem(tagsNorm, product.id, "product");
        if (!ok) {
          return res.status(400).json({ ok: false, msg: "Las tags especificadas son invalidas" });
        }
      }

      product = await prisma.products.findFirst({
        where: { AND: [{ id: product.id }, { deleted_at: null }] },
        include: {
          product_tag: { include: { tags: { select: { name: true } } } },
          product_material: {
            select: {
              id: true,
              quantity: true,
              cost: true,
              materials: {
                select: {
                  id: true,
                  name: true,
                  material_img: true,
                  unit_cost: true,
                  waste_percentage: true,
                  material_tag: { include: { tags: { select: { name: true } } } },
                  material_units: { select: { unit_name: true } },
                },
              },
            },
          },
        },
      });

      product = {
        ...product,
        product_tag: product.product_tag.map((pt) => pt.tags.name),
        product_material: product.product_material.map((pm) => {
          const m = pm.materials;
          return {
            id: m.id,
            name: m.name,
            material_img: m.material_img,
            unit_cost: m.unit_cost,
            waste_percentage: m.waste_percentage,
            material_tag: m.material_tag.map((mt) => mt.tags.name),
            material_units: m.material_units.unit_name,
            quantity: pm.quantity,
            cost: pm.cost,
          };
        }),
      };

      res.status(201).json({ ok: true, msg: "Producto creado correctamente", data: product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Server error something went wrong" });
    }
  }

  static async update(req, res) {

    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ ok: false, msg: "El id de producto debe ser un numero" });
    }

    const oldProduct = await prisma.products.findUnique({ where: { id: productId } });
    if (!oldProduct) {
      return res.status(404).json({ ok: false, msg: "No se encontro el producto que se desea modificar" });
    }

    let { name, description, estimated_time, profit_margin, product_img, materials, tags } = req.body;

    const tagsNorm = normalizeTags(tags);
    const materialsNorm = normalizeMaterials(materials);

    const estTime =
      estimated_time !== undefined ? toPosInt(estimated_time) : oldProduct.estimated_time;
    if (estimated_time !== undefined && estTime === null) {
      return res.status(400).json({ ok: false, msg: "estimated_time debe ser un entero > 0" });
    }

    const profit =
      profit_margin !== undefined ? toPosNumber(profit_margin) : oldProduct.profit_margin;
    if (profit_margin !== undefined && profit === null) {
      return res.status(400).json({ ok: false, msg: "profit_margin debe ser un numero > 0" });
    }

    const descStr = description !== undefined ? toStr(description) : oldProduct.description;

    try {

      let imgUrl = oldProduct.product_img;
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const newName = `${crypto.randomUUID()}${ext}`;
        await fs.writeFile(`./public/uploads/product_images/${newName}`, req.file.buffer);
        imgUrl = `http://localhost:3000/uploads/product_images/${newName}`;
      } else if (product_img && String(product_img).trim()) {
        imgUrl = String(product_img).trim();
      }

      let product = await prisma.products.update({
        where: { id: productId },
        data: {
          name: name ?? oldProduct.name,
          description: descStr,
          estimated_time: estTime,
          profit_margin: profit,
          product_img: imgUrl,
        },
      });

      if (materials !== undefined) {
        const pastMaterials = (
          await prisma.product_material.findMany({
            where: { product_id: oldProduct.id },
          })
        ).map((pt) => pt.material_id);

        const newIds = Array.isArray(materialsNorm) ? materialsNorm.map((m) => m.id) : [];

        if (Array.isArray(materialsNorm) && materialsNorm.length > 0) {
          const toAdd = materialsNorm.filter((m) => !pastMaterials.includes(m.id));
          if (toAdd.length > 0) {
            const ok = await MaterialController.attachMaterialsToProduct(toAdd, product.id);
            if (!ok) {
              return res.status(400).json({ ok: false, msg: "Materiales especificados invalidos" });
            }
          }
        }

        await prisma.product_material.deleteMany({
          where: {
            AND: [
              { product_id: oldProduct.id },
              { material_id: { in: pastMaterials.filter((mid) => !newIds.includes(mid)) } },
            ],
          },
        });

        if (Array.isArray(materialsNorm) && materialsNorm.length > 0) {
          await Promise.all(
            materialsNorm.map((m) =>
              prisma.product_material.updateMany({
                where: { product_id: product.id, material_id: m.id },
                data: { quantity: m.quantity },
              })
            )
          );
        }

        await recalcProductCosts(product.id);
      }

      if (tags !== undefined) {
        const pastTags = (
          await prisma.product_tag.findMany({
            where: { product_id: oldProduct.id },
          })
        ).map((pt) => pt.tag_id);

        const toAdd = Array.isArray(tagsNorm) ? tagsNorm.filter((t) => !pastTags.includes(t)) : [];
        if (toAdd.length > 0) {
          const ok = await TagController.attachTagsToItem(toAdd, product.id, "product");
          if (!ok) {
            return res.status(400).json({ ok: false, msg: "Tags especificadas invalidas" });
          }
        }

        const keep = new Set(tagsNorm ?? []);
        await prisma.product_tag.deleteMany({
          where: {
            AND: [
              { product_id: oldProduct.id },
              { tag_id: { in: pastTags.filter((t) => !keep.has(t)) } },
            ],
          },
        });
      }

      product = await prisma.products.findFirst({
        where: { AND: [{ id: product.id }, { deleted_at: null }] },
        include: {
          product_tag: { include: { tags: { select: { name: true } } } },
          product_material: {
            select: {
              id: true,
              quantity: true,
              cost: true,
              materials: {
                select: {
                  id: true,
                  name: true,
                  material_img: true,
                  unit_cost: true,
                  waste_percentage: true,
                  material_tag: { include: { tags: { select: { name: true } } } },
                  material_units: { select: { unit_name: true } },
                },
              },
            },
          },
        },
      });

      product = {
        ...product,
        product_tag: product.product_tag.map((pt) => pt.tags.name),
        product_material: product.product_material.map((pm) => {
          const m = pm.materials;
          return {
            id: m.id,
            name: m.name,
            material_img: m.material_img,
            unit_cost: m.unit_cost,
            waste_percentage: m.waste_percentage,
            material_tag: m.material_tag.map((mt) => mt.tags.name),
            material_units: m.material_units.unit_name,
            quantity: pm.quantity,
            cost: pm.cost,
          };
        }),
      };

      res.json({ ok: true, msg: "Producto actualizado correctamente", data: product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Server error something went wrong" });
    }
  }

  static async delete(req, res) {
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ ok: false, msg: "El id de producto debe ser un numero" });
    }

    const exists = await prisma.products.findUnique({ where: { id: productId } });
    if (!exists) {
      return res.status(404).json({ ok: false, msg: "No se encontro el producto que se desea eliminar" });
    }

    try {
      const { id: inactiveId } = await prisma.products.update({
        where: { id: productId },
        data: { deleted_at: new Date() },
      });

      res.json({ ok: true, msg: "Se elimino el producto correctamente", id: inactiveId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Server error something went wrong" });
    }
  }
}
