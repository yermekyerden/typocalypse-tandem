-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "missionVersion" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "currentCwd" TEXT NOT NULL,
    "currentVfsJson" TEXT NOT NULL,
    "stepCount" INTEGER NOT NULL DEFAULT 0,
    "startedAtUtc" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAtUtc" DATETIME NOT NULL,
    "finishedAtUtc" DATETIME
);

-- CreateTable
CREATE TABLE "AttemptStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "clientCommandId" TEXT NOT NULL,
    "inputLine" TEXT NOT NULL,
    "stdout" TEXT NOT NULL,
    "stderr" TEXT NOT NULL,
    "exitCode" INTEGER NOT NULL,
    "cwdAfter" TEXT NOT NULL,
    "validationJson" TEXT NOT NULL,
    "traceJson" TEXT NOT NULL,
    "createdAtUtc" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttemptStep_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");

-- CreateIndex
CREATE INDEX "Attempt_userId_missionId_idx" ON "Attempt"("userId", "missionId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptStep_attemptId_clientCommandId_key" ON "AttemptStep"("attemptId", "clientCommandId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptStep_attemptId_stepIndex_key" ON "AttemptStep"("attemptId", "stepIndex");
