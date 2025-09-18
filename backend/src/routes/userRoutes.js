import express from "express";
import UserController from "../controllers/UserController.js";

const userRouter = express.Router();

userRouter.post('/register', UserController.register);
userRouter.get('/register/google', UserController.oauthGoogle);
userRouter.get('/register/oauth', UserController.oauthRegister);
userRouter.post('/login', UserController.login);

export default userRouter;
