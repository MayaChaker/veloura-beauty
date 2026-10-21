-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitWindow" (
    "key" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "RateLimitWindow_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");
