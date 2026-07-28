import { CookieOptions, Router } from "express";
import { registerSchema, loginSchema } from "./dto";
import * as authService from "./service";
import { validate } from "@/common/middlewares/validate";
import { asyncHandler } from "@/common/utils/async-handler";
import { env } from "@/common/config/env.config";
import { authGuard } from "@/common/middlewares/auth-guard";

const router = Router();
console.dir("Auth router initialized /api/auth successfully");

const optionsCookies: CookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: env.node === "prod" ? "none" : "lax",
  secure: env.node === "prod",
};

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await authService.register(req.body);
    res.cookie("refresh", refreshToken, optionsCookies);
    res.status(201).json({ token: accessToken });
  }),
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await authService.login(req.body);
    res.cookie("refresh", refreshToken, optionsCookies);
    res.status(200).json({ token: accessToken });
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await authService.refresh(
      req.cookies.refresh,
    );
    res.cookie("refresh", refreshToken, optionsCookies);
    res.status(200).json({ token: accessToken });
  }),
);

router.get(
  "/me",
  authGuard(),
  asyncHandler(async (req, res) => {
    const user = await authService.me(req.userId);
    res.status(200).json(user);
  }),
);

export default router;
