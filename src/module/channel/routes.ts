import { asyncHandler } from "@/common/utils/async-handler";
import { Router } from "express";
import * as channelService from "./service";
import { validate } from "@/common/middlewares/validate";
import { createChannelSchema, updateChannelSchema } from "./dto";
import { authGuard } from "@/common/middlewares/auth-guard";

const channelRoutes = Router();
console.dir("Channel router initialized /api/channel successfully");

channelRoutes.post(
  "/create",
  validate(createChannelSchema),
  authGuard(),
  asyncHandler(async (req, res) => {
    const channel = await channelService.create(req.body, req.userId!);
    res.status(201).json(channel);
  }),
);

channelRoutes.get(
  "/findAll",
  authGuard(),
  asyncHandler(async (req, res) => {
    const channels = await channelService.findAll(req.userId!);
    res.status(200).json(channels);
  }),
);

channelRoutes.patch(
  "/update/:id",
  authGuard(),
  validate(updateChannelSchema),
  asyncHandler(async (req, res) => {
    const channels = await channelService.update(
      req.params.id as string,
      req.body,
      req.userId!,
    );
    res.status(200).json(channels);
  }),
);

channelRoutes.delete(
  "/remove/:id",
  authGuard(),
  asyncHandler(async (req, res) => {
    const channels = await channelService.remove(
      req.params.id as string,
      req.userId!,
    );
    res.status(200).json(channels);
  }),
);

export default channelRoutes;
