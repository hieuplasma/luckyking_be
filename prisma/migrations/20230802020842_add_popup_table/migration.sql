-- CreateTable
CREATE TABLE "Popup" (
    "id" SERIAL NOT NULL,
    "content" TEXT,
    "show" BOOLEAN,

    CONSTRAINT "Popup_pkey" PRIMARY KEY ("id")
);
