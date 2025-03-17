/*
  Warnings:

  - You are about to drop the `Challenge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_userId_fkey";

-- DropTable
DROP TABLE "Challenge";
