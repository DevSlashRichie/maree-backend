ALTER TABLE "reward" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "discount" ALTER COLUMN "current_uses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "discount" ALTER COLUMN "hidden" SET NOT NULL;