import { z } from "zod";

export const createChannelSchema = z.object({
  username: z.string().min(1),
  title: z.string(),
});

export const updateChannelSchema = createChannelSchema.partial();

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
