-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('UnitValue');

-- CreateTable
CREATE TABLE "Relay" (
    "url" TEXT NOT NULL,

    CONSTRAINT "Relay_pkey" PRIMARY KEY ("url")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "sig" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "kind" BIGINT NOT NULL,
    "tags" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "height" BIGSERIAL NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReferenceRelation" (
    "referrerEventId" TEXT NOT NULL,
    "refereeEventId" TEXT NOT NULL,
    "recommendedRelayUrl" TEXT,

    CONSTRAINT "EventReferenceRelation_pkey" PRIMARY KEY ("referrerEventId","refereeEventId")
);

-- CreateTable
CREATE TABLE "EventDeletionRelation" (
    "deleterEventId" TEXT NOT NULL,
    "deleteeEventId" TEXT NOT NULL,

    CONSTRAINT "EventDeletionRelation_pkey" PRIMARY KEY ("deleterEventId","deleteeEventId")
);

-- CreateTable
CREATE TABLE "EventReactionRelation" (
    "reacterEventId" TEXT NOT NULL,
    "reacteeEventId" TEXT NOT NULL,

    CONSTRAINT "EventReactionRelation_pkey" PRIMARY KEY ("reacterEventId","reacteeEventId")
);

-- CreateTable
CREATE TABLE "EventReferenceRelationState" (
    "id" "UnitType" NOT NULL,
    "height" BIGINT NOT NULL,

    CONSTRAINT "EventReferenceRelationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDeletionRelationState" (
    "id" "UnitType" NOT NULL,
    "height" BIGINT NOT NULL,

    CONSTRAINT "EventDeletionRelationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReactionRelationState" (
    "id" "UnitType" NOT NULL,
    "height" BIGINT NOT NULL,

    CONSTRAINT "EventReactionRelationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReactionCountState" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "height" BIGINT NOT NULL,
    "reactionCounts" JSONB NOT NULL,

    CONSTRAINT "EventReactionCountState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_height_key" ON "Event"("height");

-- CreateIndex
CREATE UNIQUE INDEX "EventReactionCountState_eventId_key" ON "EventReactionCountState"("eventId");

-- AddForeignKey
ALTER TABLE "EventReferenceRelation" ADD CONSTRAINT "EventReferenceRelation_referrerEventId_fkey" FOREIGN KEY ("referrerEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReferenceRelation" ADD CONSTRAINT "EventReferenceRelation_refereeEventId_fkey" FOREIGN KEY ("refereeEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReferenceRelation" ADD CONSTRAINT "EventReferenceRelation_recommendedRelayUrl_fkey" FOREIGN KEY ("recommendedRelayUrl") REFERENCES "Relay"("url") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDeletionRelation" ADD CONSTRAINT "EventDeletionRelation_deleterEventId_fkey" FOREIGN KEY ("deleterEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDeletionRelation" ADD CONSTRAINT "EventDeletionRelation_deleteeEventId_fkey" FOREIGN KEY ("deleteeEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReactionRelation" ADD CONSTRAINT "EventReactionRelation_reacterEventId_fkey" FOREIGN KEY ("reacterEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReactionRelation" ADD CONSTRAINT "EventReactionRelation_reacteeEventId_fkey" FOREIGN KEY ("reacteeEventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReactionCountState" ADD CONSTRAINT "EventReactionCountState_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
