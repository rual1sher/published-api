import { Router } from "express";
import authRoutes from "@/module/auth/routes";
import channelRoutes from "@/module/channel/routes";
import postRoutes from "@/module/post/routes";
import uploadRoutes from "@/module/upload/routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/channel", channelRoutes);
router.use("/post", postRoutes);
router.use("/upload", uploadRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;
