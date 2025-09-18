import express from "express";
import UserController from "../controllers/UserController.js";
import authenticate from "../middlewares/authenticate.js";

const userRouter = express.Router();

userRouter.post('/register', UserController.register);
userRouter.get('/register/google', UserController.oauthGoogle);
userRouter.get('/register/oauth', UserController.oauthRegister);
userRouter.post('/login', UserController.login);
userRouter.get('/is_auth', authenticate, UserController.isAuth);

export default userRouter;
