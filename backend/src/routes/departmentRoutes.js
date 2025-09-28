import express from "express";
import DepartmentController from "../controllers/DepartmentController.js";

const departmentRouter = express.Router();

departmentRouter.get('/', DepartmentController.getAll);
departmentRouter.get('/:id', DepartmentController.getById);
departmentRouter.post('/', DepartmentController.create);
departmentRouter.patch('/:id', DepartmentController.update);
departmentRouter.delete('/:id', DepartmentController.delete);

export default departmentRouter;
