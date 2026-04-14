-- AlterTable
ALTER TABLE "users" ADD COLUMN "lastBookingDate" DATETIME;
ALTER TABLE "users" ADD COLUMN "lastReminderSent" DATETIME;

-- CreateTable
CREATE TABLE "schedule_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '19:00',
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_configs_dayOfWeek_key" ON "schedule_configs"("dayOfWeek");
