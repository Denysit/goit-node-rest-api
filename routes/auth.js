import express from "express";
import AuthController from "../controllers/auth.js";
import validateBody from "../helpers/validateBody.js";
import { createUserSchema } from "../schemas/userSchemas.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register",validateBody(createUserSchema), AuthController.register);
userRouter.post("/login", validateBody(createUserSchema), AuthController.login);
userRouter.get("/logout", authMiddleware, AuthController.logout);
userRouter.get("/current", authMiddleware, AuthController.current)


export default userRouter;