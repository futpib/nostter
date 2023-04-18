-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "sig" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "kind" INTEGER NOT NULL,
    "tags" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
