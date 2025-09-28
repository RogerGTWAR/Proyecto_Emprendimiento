import express from "express";
import CompanyController from "../controllers/CompanyController.js";

const companyRouter = express.Router();

companyRouter.get('/', CompanyController.getAll);
companyRouter.get('/:id', CompanyController.getById);
companyRouter.post('/', CompanyController.create);
companyRouter.patch('/:id', CompanyController.update);
companyRouter.delete('/:id', CompanyController.delete);

export default companyRouter;
