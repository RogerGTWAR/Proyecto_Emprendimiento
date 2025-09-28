import { Router } from "express";
import WorkerController from "../controllers/WorkerController.js";

const workerRouter = Router();

workerRouter.get("/",  WorkerController.getAll);
workerRouter.get("/:id", WorkerController.getById);
workerRouter.post("/",  WorkerController.create);
workerRouter.patch("/:id", WorkerController.update);
workerRouter.delete("/:id", WorkerController.delete);

export default workerRouter;
