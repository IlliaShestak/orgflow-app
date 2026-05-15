-- AlterTable
ALTER TABLE "users" ADD COLUMN     "generated_password" TEXT,
ADD COLUMN     "password_hash" TEXT;
