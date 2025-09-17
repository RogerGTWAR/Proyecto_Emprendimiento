import express from "express";
import TagController from "../controllers/TagController.js";

const tagRouter = express.Router();

tagRouter.get('/', TagController.getAll);
tagRouter.get('/{:id}', TagController.getById);

export default tagRouter;
