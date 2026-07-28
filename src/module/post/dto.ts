import { PostStatus } from "@prisma/generated/prisma/enums";
import { z } from "zod";

export const createPostSchema = z.object({
  channelId: z.string().min(1),
  date: z.coerce.date(),
  text: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
});

export const updatePostSchema = z
  .object({
    text: z.string().min(1),
    date: z.coerce.date(),
    imageUrl: z.string(),
  })
  .partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
