import express from "express";
import ServicesController from "../controllers/ServicesController.js";

const serviceRouter = express.Router();

serviceRouter.get('/', ServicesController.getAll);
serviceRouter.get('/:id', ServicesController.getById);
serviceRouter.post('/', ServicesController.create);
serviceRouter.patch('/:id', ServicesController.update);
serviceRouter.delete('/:id', ServicesController.delete);

export default serviceRouter;
