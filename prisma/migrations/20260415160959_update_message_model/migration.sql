/*
  Warnings:

  - You are about to drop the column `message` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Message` table. All the data in the column will be lost.
  - Added the required column `customerPhone` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageText` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_phone_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "message",
DROP COLUMN "phone",
ADD COLUMN     "createdByName" TEXT,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "errorText" TEXT,
ADD COLUMN     "messageText" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'qarz_eslatma',
ALTER COLUMN "status" SET DEFAULT 'navbatda';

-- CreateIndex
CREATE INDEX "Message_customerPhone_idx" ON "Message"("customerPhone");
