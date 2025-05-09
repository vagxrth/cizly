-- CreateTable
CREATE TABLE "CanvasMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "canvasId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanvasMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CanvasMessage_canvasId_idx" ON "CanvasMessage"("canvasId");

-- CreateIndex
CREATE INDEX "CanvasMessage_userId_idx" ON "CanvasMessage"("userId");

-- AddForeignKey
ALTER TABLE "CanvasMessage" ADD CONSTRAINT "CanvasMessage_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canvas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasMessage" ADD CONSTRAINT "CanvasMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
