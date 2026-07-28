import { AppError } from "@/common/errors/app-error";
import { telegramUrl } from "@/jobs/post";
import axios from "axios";

export async function checkBotIsAdmin(chatId: string): Promise<boolean> {
  try {
    const { data: me } = await axios.get(telegramUrl + "/getMe");
    const botId = me.result.id;

    const { data } = await axios.get(telegramUrl + "/getChatMember", {
      params: { chat_id: chatId, user_id: botId },
    });

    return ["administrator", "creator"].includes(data.result.status);
  } catch (err: any) {
    if (err.response?.data.error_code === 400) {
      throw new AppError(
        400,
        "Бот не добавлен в канал или не является админом",
      );
    }
    throw new AppError(400, "Бот не добавлен в канал");
  }
}

export async function checkBotChannelExists(chatId: string) {
  try {
    const { data } = await axios.get(telegramUrl + "/getChat", {
      params: { chat_id: chatId },
    });
    if (data.result.type !== "channel") {
      throw new AppError(400, "Указанный чат не является каналом");
    }

    return data.result;
  } catch (err: any) {
    throw new AppError(400, "Канал не найден или бот не добавлен в канал");
  }
}

export async function editTelegramMessage(
  chatId: string,
  messageId: number,
  text?: string | null,
  imageUrl?: string | null,
) {
  if (imageUrl) {
    const { data } = await axios.post(telegramUrl + "/editMessageMedia", {
      chat_id: chatId,
      message_id: messageId,
      media: JSON.stringify({
        type: "photo",
        media: imageUrl,
        caption: text ?? undefined,
        parse_mode: "HTML",
      }),
    });
    return data.result;
  } else {
    const { data } = await axios.post(telegramUrl + "/editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: text ?? "",
      parse_mode: "HTML",
    });
    return data.result;
  }
}

export async function deleteTelegramMessage(chatId: string, messageId: number) {
  await axios.post(telegramUrl + "/deleteMessage", {
    chat_id: chatId,
    message_id: messageId,
  });
}
