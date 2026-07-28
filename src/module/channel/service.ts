import { prisma } from "@/common/prisma/prisma";
import { CreateChannelInput, UpdateChannelInput } from "./dto";
import { AppError } from "@/common/errors/app-error";
import { checkBotChannelExists, checkBotIsAdmin } from "./telegram.service";

export async function create(data: CreateChannelInput, userId: string) {
  const username = data.username.startsWith("@")
    ? data.username
    : `@${data.username}`;

  const existing = await prisma.channels.findFirst({
    where: { username: username, deletedAt: null },
  });
  if (existing) throw new AppError(409, "Channel already exists");

  let chatInfo = await checkBotChannelExists(username);
  await checkBotIsAdmin(username);

  return prisma.channels.create({
    data: {
      username: username,
      title: chatInfo.title,
      ownerId: userId,
    },
  });
}

export async function findAll(userId: string) {
  const channels = await prisma.channels.findMany({
    where: { ownerId: userId, deletedAt: null },
  });
  return channels;
}

export async function update(
  id: string,
  data: UpdateChannelInput,
  userId: string,
) {
  const channel = await prisma.channels.findFirst({
    where: { id, ownerId: userId, deletedAt: null },
  });
  if (!channel) throw new AppError(404, "Channel not found");

  if (data.username) {
    const existing = await prisma.channels.findFirst({
      where: { username: data.username, deletedAt: null, id: { not: id } },
    });
    if (existing) throw new AppError(409, "Channel already exists");

    await checkBotChannelExists(data.username);
    await checkBotIsAdmin(data.username);
  }

  const channels = await prisma.channels.update({
    where: { id, ownerId: userId, deletedAt: null },
    data,
  });

  return channels;
}

export async function remove(id: string, userId: string) {
  const channel = await prisma.channels.findFirst({
    where: { id, ownerId: userId, deletedAt: null },
  });
  if (!channel) throw new AppError(404, "Channel not found");

  await prisma.channels.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return channel;
}
