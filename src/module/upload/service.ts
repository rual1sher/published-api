import { env } from "@/common/config/env.config";

export function buildFileUrl(filename: string) {
  return `${env.appUrl}/uploads/${filename}`;
}
