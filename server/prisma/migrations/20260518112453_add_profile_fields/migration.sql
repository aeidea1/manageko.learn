-- AlterTable
ALTER TABLE "User" ADD COLUMN "bio" TEXT,
ADD COLUMN "coverColor" TEXT DEFAULT '#0056D2',
ADD COLUMN "github" TEXT,
ADD COLUMN "telegram" TEXT,
ADD COLUMN "vk" TEXT;

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserActivity_userId_date_key" ON "UserActivity"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;