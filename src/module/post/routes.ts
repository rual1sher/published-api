import { Router } from "express";
import * as postService from "./service";
import { validate } from "@/common/middlewares/validate";
import { createPostSchema, updatePostSchema } from "./dto";
import { authGuard } from "@/common/middlewares/auth-guard";
import { asyncHandler } from "@/common/utils/async-handler";

const postRoutes = Router();
console.dir("Post router initialized /api/post successfully");

postRoutes.post(
  "/create",
  validate(createPostSchema),
  authGuard(),
  asyncHandler(async (req, res) => {
    const post = await postService.create(req.body, req.userId!);
    res.status(201).json(post);
  }),
);

postRoutes.get(
  "/findAll",
  authGuard(),
  asyncHandler(async (req, res) => {
    const posts = await postService.findAll(req.userId!);
    res.status(200).json(posts);
  }),
);

postRoutes.get(
  "/findOne/:id",
  authGuard(),
  asyncHandler(async (req, res) => {
    const post = await postService.findOne(
      req.params.id as string,
      req.userId!,
    );
    res.status(200).json(post);
  }),
);

postRoutes.patch(
  "/update/:id",
  validate(updatePostSchema),
  authGuard(),
  asyncHandler(async (req, res) => {
    const post = await postService.update(
      req.params.id as string,
      req.body,
      req.userId!,
    );
    res.status(200).json(post);
  }),
);

postRoutes.put(
  "/status/:id",
  authGuard(),
  asyncHandler(async (req, res) => {
    const post = await postService.like(req.params.id as string, req.userId!);
    res.status(200).json(post);
  }),
);

postRoutes.delete(
  "/remove/:id",
  authGuard(),
  asyncHandler(async (req, res) => {
    const post = await postService.remove(req.params.id as string, req.userId!);
    res.status(200).json(post);
  }),
);

export default postRoutes;
