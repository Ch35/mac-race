/*
  Warnings:

  - You are about to drop the column `raceId` on the `Boat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Boat" DROP CONSTRAINT "Boat_raceId_fkey";

-- AlterTable
ALTER TABLE "Boat" DROP COLUMN "raceId";

-- CreateTable
CREATE TABLE "_BoatToRace" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BoatToRace_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BoatToRace_B_index" ON "_BoatToRace"("B");

-- AddForeignKey
ALTER TABLE "_BoatToRace" ADD CONSTRAINT "_BoatToRace_A_fkey" FOREIGN KEY ("A") REFERENCES "Boat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoatToRace" ADD CONSTRAINT "_BoatToRace_B_fkey" FOREIGN KEY ("B") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;
