/*
  Warnings:

  - You are about to drop the column `lapEnd` on the `Boat` table. All the data in the column will be lost.
  - You are about to drop the column `lapStart` on the `Boat` table. All the data in the column will be lost.
  - You are about to drop the column `lapTime` on the `Boat` table. All the data in the column will be lost.
  - You are about to drop the column `laps` on the `Boat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Boat" DROP COLUMN "lapEnd",
DROP COLUMN "lapStart",
DROP COLUMN "lapTime",
DROP COLUMN "laps";

-- CreateTable
CREATE TABLE "Lap" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "boatId" TEXT NOT NULL,

    CONSTRAINT "Lap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lap" ADD CONSTRAINT "Lap_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
