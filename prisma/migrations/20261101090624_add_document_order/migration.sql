-- CreateTable
CREATE TABLE "DocumentOrder" (
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "DocumentOrder_pkey" PRIMARY KEY ("section","key")
);
