-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Customer', 'Admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'Customer';
