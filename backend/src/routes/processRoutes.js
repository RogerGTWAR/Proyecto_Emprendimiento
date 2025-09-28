import express from "express";
import ProcessesController from "../controllers/ProcessesController.js";

const processRouter = express.Router();

processRouter.get('/', ProcessesController.getAll);
processRouter.get('/:id', ProcessesController.getById);
processRouter.post('/', ProcessesController.create);
processRouter.patch('/:id', ProcessesController.update);
processRouter.delete('/:id', ProcessesController.delete);

export default processRouter;
