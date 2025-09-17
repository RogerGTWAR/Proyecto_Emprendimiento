import prisma from "../database.js";

export default class TagController {

  static async getAll(req, res) {

    try {
      const tags = await prisma.tags.findMany({
        where: { deleted_at: null }
      });

      res.json({
        ok: true,
        data: tags
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

    const tagId = parseInt(id);

    if (isNaN(tagId)) {
      return res.status(400).json({
        ok: false,
        msg: "El id del tag debe ser un numero"
      })
    }

    let tag;

    try {

      tag = await prisma.tags.findFirst({
        where: {
          AND: [{ id: tagId }, { deleted_at: null }]
        }
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        msg: "Server Error, something went wrong"
      })
    }

    if (tag === null) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontro el tag con id: ${tagId}`
      })
    }

    res.json({
      ok: true,
      data: tag
    });
  }

  static async attachTagsToItem(tagIds, itemId, itemType) {

    const tags = await prisma.tags.findMany({
      where: {
        id: {
          in: tagIds
        }
      }
    });

    if (tags.length < 1) {
      return false;
    }

    try {

      if (itemType === 'product') {

        await prisma.product_tag.createMany({
          data: tags.map(({ id }) => {
            return {
              product_id: itemId,
              tag_id: id
            }
          })
        });
      } else if (itemType === 'material') {
        await prisma.material_tag.createMany({
          data: tags.map(({ id }) => {
            return {
              material_id: itemId,
              tag_id: id
            }
          })
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
