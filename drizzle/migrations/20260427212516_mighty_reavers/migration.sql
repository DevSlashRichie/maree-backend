ALTER TABLE "product_allowed_ingredient" DROP CONSTRAINT "product_allowed_ingredient_allowed_product_id_product_id_fkey";--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "order_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product_allowed_ingredient" ADD CONSTRAINT "product_allowed_ingredient_GsPW1bxOPHex_fkey" FOREIGN KEY ("allowed_product_id") REFERENCES "product_variant"("id");
