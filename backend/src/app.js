import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import materialRouter from "./routes/materialRoutes.js";
import productRouter from "./routes/productRoutes.js";
import tagRouter from "./routes/tagRoutes.js";
import userRouter from "./routes/userRoutes.js";
import workerRouter from "./routes/workerRoutes.js";
import serviceRouter from "./routes/serviceRoutes.js";
import processRouter from "./routes/processRoutes.js";
import departmentRouter from "./routes/departmentRoutes.js"; 
import companyRouter from "./routes/companyRoutes.js";  

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/materials", materialRouter);
app.use("/api/products", productRouter);
app.use("/api/tags", tagRouter);
app.use("/api/users", userRouter);
app.use("/api/workers", workerRouter);
app.use("/api/services", serviceRouter);
app.use("/api/processes", processRouter);
app.use("/api/departments", departmentRouter); 
app.use("/api/companies", companyRouter);  

export default app;
