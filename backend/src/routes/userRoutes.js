import express from "express";
import UserController from "../controllers/UserController.js";
import authenticate from "../middlewares/authenticate.js";
import validateFields from "../middlewares/validateFields.js";
import { check } from "express-validator";
import COMPANY_TYPES from "../const/companyTypes.js";

const userRouter = express.Router();

userRouter.post('/register', [
  check('company_name', "Ingresa el nombre de tu empresa").trim().notEmpty(),
  check('company_type', "Ingresa el tipo de rubro de tu empresa o asegurate que sea una de las opciones").trim().notEmpty().isIn(COMPANY_TYPES),
  check('email', "Ingresa tu correo y asegurate que sea valido").trim().notEmpty().isEmail(),
  check('password', "Ingresa tu contraseña").trim().notEmpty(),
  validateFields
], UserController.register);

userRouter.get('/register/google', UserController.oauthGoogle);

userRouter.get('/register/oauth', UserController.oauthRegister);

userRouter.post('/login', [
  check('email', "Ingresa tu correo y asegurate que sea valido").trim().notEmpty().isEmail(),
  check('password', "Ingresa tu contraseña").trim().notEmpty(),
  validateFields
], UserController.login);

userRouter.get("/verify_email", UserController.verifyMail);

userRouter.get('/is_auth', authenticate, UserController.isAuth);

export default userRouter;
