import express from "express";
import contactsRoutes from "./contacts.js";
import userRoutes from "./auth.js";
import authMiddleware from "../middleware/auth.js";


const routes = express.Router();

routes.use("/contacts", authMiddleware, contactsRoutes);
routes.use("/users", userRoutes);


export default routes;
