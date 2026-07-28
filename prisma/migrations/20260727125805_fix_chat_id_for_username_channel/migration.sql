/*
  Warnings:

  - You are about to drop the column `chatId` on the `channels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[channel_username]` on the table `channels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `channel_username` to the `channels` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "channels_chatId_key";

-- AlterTable
ALTER TABLE "channels" DROP COLUMN "chatId",
ADD COLUMN     "channel_username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "channels_channel_username_key" ON "channels"("channel_username");
