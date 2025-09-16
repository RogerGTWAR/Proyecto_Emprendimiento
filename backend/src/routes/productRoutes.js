import express from "express";
import ProductController from "../controllers/ProductController.js";
const productRouter = express.Router();

productRouter.get('/', ProductController.getAll);
productRouter.get('/{:id}', ProductController.getById);
productRouter.post('/', ProductController.create);
productRouter.patch('/{:id}', ProductController.update);
productRouter.delete('/{:id}', ProductController.delete);

export default productRouter;
