import express from "express";
import MaterialController from "../controllers/MaterialController.js";

const materialRouter = express.Router();

materialRouter.get('/', MaterialController.getAll);
materialRouter.get('/{:id}', MaterialController.getById);
materialRouter.post('/', MaterialController.create);
materialRouter.patch('/{:id}', MaterialController.update);
materialRouter.delete('/{:id}', MaterialController.delete);

export default materialRouter;
