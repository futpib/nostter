-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "firstDeleterEventId" TEXT;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_firstDeleterEventId_fkey" FOREIGN KEY ("firstDeleterEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
