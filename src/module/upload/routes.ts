import { Router } from "express";
import { authGuard } from "@/common/middlewares/auth-guard";
import { asyncHandler } from "@/common/utils/async-handler";
import { AppError } from "@/common/errors/app-error";
import { uploadImage } from "./middleware";
import { buildFileUrl } from "./service";

const uploadRoutes = Router();
console.dir("Upload router initialized /api/upload successfully");

uploadRoutes.post(
  "/image",
  authGuard(),
  uploadImage.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError(400, "Файл не найден");
    res.status(201).json({ url: buildFileUrl(req.file.filename) });
  }),
);

export default uploadRoutes;
