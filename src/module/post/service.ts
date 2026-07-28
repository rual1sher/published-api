import { prisma } from "@/common/prisma/prisma";
import { AppError } from "@/common/errors/app-error";
import { CreatePostInput, UpdatePostInput } from "./dto";
import { PostStatus } from "@prisma/generated/prisma/enums";
import {
  deleteTelegramMessage,
  editTelegramMessage,
} from "@/module/channel/telegram.service";

async function assertChannelOwner(channelId: string, userId: string) {
  const channel = await prisma.channels.findFirst({
    where: { id: channelId, ownerId: userId, deletedAt: null },
  });
  if (!channel) {
    throw new AppError(404, "Channel not found");
  }

  return channel;
}

async function findPost(id: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id, userId, deletedAt: null },
    include: { channel: true },
  });
  if (!post) throw new AppError(404, "Post not found");
  return post;
}

export async function create(data: CreatePostInput, userId: string) {
  await assertChannelOwner(data.channelId, userId);

  const post = await prisma.post.create({ data: { ...data, userId } });
  return post;
}

export async function findAll(userId: string) {
  const posts = await prisma.post.findMany({
    where: { deletedAt: null, userId },
    orderBy: { createdAt: "desc" },
  });

  return posts;
}

export async function findOne(id: string, userId: string) {
  const post = await findPost(id, userId);
  return post;
}

export async function update(
  id: string,
  data: UpdatePostInput,
  userId: string,
) {
  const existing = await findPost(id, userId);
  const post = await prisma.post.update({ where: { id }, data });

  if (existing.status === PostStatus.PUBLISHED && existing.tgMessageId) {
    try {
      const result = await editTelegramMessage(
        existing.channel.username,
        existing.tgMessageId,
        data.text,
        data.imageUrl,
      );

      await prisma.post.update({
        where: { id },
        data: { ...data, tgMessageId: result.message_id },
      });
    } catch (err) {
      console.error("[post] failed to edit telegram message:", err);
      throw new AppError(502, "Failed to edit telegram message");
    }
  }

  return post;
}

export async function remove(id: string, userId: string) {
  const existing = await findPost(id, userId);
  const post = await prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  if (existing.status === PostStatus.PUBLISHED && existing.tgMessageId) {
    try {
      await deleteTelegramMessage(
        existing.channel.username,
        existing.tgMessageId,
      );
    } catch (err) {
      console.error("[post] failed to delete telegram message:", err);
      throw new AppError(502, "Failed to delete telegram message");
    }
  }

  return post;
}

export async function like(id: string, userId: string) {
  const post = await findPost(id, userId);
  const newPost = await prisma.post.update({
    where: { id },
    data: {
      status:
        post.status === PostStatus.DRAFT
          ? PostStatus.QUEUED
          : post.status === PostStatus.QUEUED
            ? PostStatus.DRAFT
            : post.status,
    },
  });
  return newPost;
}
