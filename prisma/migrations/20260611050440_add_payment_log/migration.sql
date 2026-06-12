-- AlterTable
ALTER TABLE "payments" ADD COLUMN "metadata" TEXT;

-- CreateTable
CREATE TABLE "payment_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payment_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "message" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
