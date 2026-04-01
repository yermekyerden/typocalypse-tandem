-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN "lessonId" TEXT;

-- CreateIndex
CREATE INDEX "Attempt_userId_lessonId_idx" ON "Attempt"("userId", "lessonId");
