-- CreateTable
CREATE TABLE "UserFollower" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollower_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFollower_followerId_idx" ON "UserFollower"("followerId");

-- CreateIndex
CREATE INDEX "UserFollower_followingId_idx" ON "UserFollower"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollower_followerId_followingId_key" ON "UserFollower"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "UserFollower" ADD CONSTRAINT "UserFollower_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollower" ADD CONSTRAINT "UserFollower_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
