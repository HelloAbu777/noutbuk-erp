/*
  Warnings:

  - You are about to drop the column `telegramChatId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `telegramBotToken` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `telegramChatId` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "telegramChatId";

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "telegramBotToken",
DROP COLUMN "telegramChatId";
