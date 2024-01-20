-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "transitCompany" TEXT NOT NULL,
    "busNumber" TEXT NOT NULL,
    "busDestination" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
