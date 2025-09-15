import express from "express";
import MaterialController from "../controllers/MaterialController.js";

const materialRouter = express.Router();

materialRouter.get('/', MaterialController.getAll);

export default materialRouter;
