import express from "express";
import routes from "./routers";
import { errorHandler } from "@/common/middlewares/error-handler";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./common/config/env.config";
import { uploadsDir } from "@/module/upload/middleware";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: env.origins, credentials: true }));
app.use("/uploads", express.static(uploadsDir));
app.use("/api", routes);
app.use(errorHandler);

export default app;
