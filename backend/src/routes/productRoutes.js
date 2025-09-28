import express from "express";
import ProductController from "../controllers/ProductController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const productRouter = express.Router();

productRouter.get('/', ProductController.getAll);
productRouter.get('/{:id}', ProductController.getById);
productRouter.post('/', upload.single('product_img'), ProductController.create);
productRouter.patch('/{:id}', upload.single('product_img'), ProductController.update);
productRouter.delete('/{:id}', ProductController.delete);

export default productRouter;