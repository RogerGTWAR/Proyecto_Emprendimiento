import express from "express";
import multer from "multer";
import MaterialController from "../controllers/MaterialController.js";

const upload = multer({ storage: multer.memoryStorage() });

const materialRouter = express.Router();

materialRouter.get('/', MaterialController.getAll);
materialRouter.get('/{:id}', MaterialController.getById);
materialRouter.post('/', upload.single('material_img'), MaterialController.create);
materialRouter.patch('/{:id}', upload.single('material_img'), MaterialController.update);
materialRouter.delete('/{:id}', MaterialController.delete);

export default materialRouter;