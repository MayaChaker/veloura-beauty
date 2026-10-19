-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Product_position_idx" ON "Product"("position");
