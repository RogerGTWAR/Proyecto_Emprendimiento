import express from "express";
import MaterialController from "../controllers/MaterialController.js";

const materialRouter = express.Router();

materialRouter.get('/', MaterialController.getAll);
materialRouter.get('/{:id}', MaterialController.getById);

export default materialRouter;
