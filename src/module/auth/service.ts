import { AppError } from "@/common/errors/app-error";
import { RegisterInput, LoginInput } from "./dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/common/prisma/prisma";
import { env } from "@/common/config/env.config";

export async function register(data: RegisterInput) {
  const existing = await prisma.users.findFirst({
    where: { username: data.username, deletedAt: null },
  });
  if (existing) throw new AppError(409, "User already exists");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.users.create({
    data: { ...data, password: hashed },
  });

  const accessToken = jwt.sign(
    { userId: user.id },
    env.jwt.accessToken as string,
    {
      expiresIn: env.jwt.accessExpiresIn as any,
    },
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    env.jwt.refreshToken as string,
    {
      expiresIn: env.jwt.refreshExpiresIn as any,
    },
  );

  return { accessToken, refreshToken };
}

export async function login(data: LoginInput) {
  const user = await prisma.users.findFirst({
    where: { username: data.username, deletedAt: null },
  });
  if (!user) throw new AppError(401, "Invalid credentials");

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new AppError(401, "Invalid credentials");

  const accessToken = jwt.sign(
    { userId: user.id },
    env.jwt.accessToken as string,
    {
      expiresIn: env.jwt.accessExpiresIn as any,
    },
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    env.jwt.refreshToken as string,
    {
      expiresIn: env.jwt.refreshExpiresIn as any,
    },
  );

  await prisma.users.update({
    where: { id: user.id },
    data: { token: refreshToken },
  });

  return { accessToken, refreshToken };
}

export async function refresh(refreshToken: string) {
  const user = await prisma.users.findFirst({
    where: { token: refreshToken, deletedAt: null },
  });
  if (!user) throw new AppError(401, "Invalid credentials");

  const accessToken = jwt.sign(
    { userId: user.id },
    env.jwt.accessToken as string,
    {
      expiresIn: env.jwt.accessExpiresIn as any,
    },
  );
  const newRefreshToken = jwt.sign(
    { userId: user.id },
    env.jwt.refreshToken as string,
    {
      expiresIn: env.jwt.refreshExpiresIn as any,
    },
  );

  await prisma.users.update({
    where: { id: user.id },
    data: { token: newRefreshToken },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function me(id?: string) {
  if (!id) throw new AppError(401, "User invalid");
  const user = await prisma.users.findFirst({
    where: { id, deletedAt: null },
    omit: { password: true, token: true },
  });
  if (!user) throw new AppError(401, "User not found");
  return user;
}
