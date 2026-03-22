-- CreateTable
CREATE TABLE "MenuRating" (
    "id" SERIAL NOT NULL,
    "menuId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuRating_userId_menuId_key" ON "MenuRating"("userId", "menuId");

-- AddForeignKey
ALTER TABLE "MenuRating" ADD CONSTRAINT "MenuRating_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuRating" ADD CONSTRAINT "MenuRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
