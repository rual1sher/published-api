import cron from "node-cron";
import { env } from "@/common/config/env.config";
import { prisma } from "@/common/prisma/prisma";
import { Post, Channels } from "@prisma/generated/prisma/client";
import axios from "axios";
import pLimit from "p-limit";

export const telegramUrl = `https://api.telegram.org/bot${env.botkey}`;
const limit = pLimit(10);

cron.schedule("* * * * *", async () => {
  console.info("[cron] publish-posts tick:", new Date().toISOString());
  try {
    await postInTg();
  } catch (err) {
    console.error("[cron] publish-posts failed:", err);
  }
});

async function postInTg() {
  const now = new Date();
  // 1. Атомарно захватываем посты — от гонки между инстансами/тиками
  const claimed = await prisma.post.updateMany({
    where: {
      status: "QUEUED",
      date: { lte: now },
      deletedAt: null,
      channel: { deletedAt: null },
    },
    data: { status: "PUBLISHING" },
  });

  if (claimed.count === 0) return;

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHING", deletedAt: null },
    include: { channel: true },
  });

  const results = await Promise.allSettled(
    posts.map((post) => limit(() => publishOnePost(post))),
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    console.error(`${failed} posts failed to publish`);
  }
}

async function publishOnePost(post: Post & { channel: Channels }) {
  const dataTg = {
    chat_id: post.channel.username,
    parse_mode: "HTML",
  };

  try {
    let messageId: number | undefined;

    if (post.imageUrl) {
      const { data } = await axios.post(`${telegramUrl}/sendPhoto`, {
        ...dataTg,
        photo: post.imageUrl,
        caption: post.text ?? undefined,
      });
      messageId = data.result.message_id;
    } else if (post.text) {
      const { data } = await axios.post(`${telegramUrl}/sendMessage`, {
        ...dataTg,
        text: post.text,
      });
      messageId = data.result.message_id;
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { tgMessageId: messageId, status: "PUBLISHED" },
    });
  } catch (err) {
    await prisma.post.update({
      where: { id: post.id },
      data: { status: "FAILED" },
    });
    throw err; // пробрасываем, чтобы Promise.allSettled засчитал rejected
  }
}
