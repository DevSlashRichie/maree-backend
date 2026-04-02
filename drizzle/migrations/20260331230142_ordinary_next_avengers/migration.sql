ALTER TABLE "loyalty_transaction" DROP CONSTRAINT "loyalty_transaction_loyalty_card_id_loyalty_card_id_fkey";--> statement-breakpoint
ALTER TABLE "product_variant" DROP CONSTRAINT "product_variant_branch_id_branch_id_fkey";--> statement-breakpoint
DROP TABLE "loyalty_card";--> statement-breakpoint
ALTER TABLE "loyalty_transaction" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "loyalty_transaction" DROP COLUMN "loyalty_card_id";--> statement-breakpoint
ALTER TABLE "product_variant" DROP COLUMN "branch_id";--> statement-breakpoint
ALTER TABLE "loyalty_transaction" ADD CONSTRAINT "loyalty_transaction_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");