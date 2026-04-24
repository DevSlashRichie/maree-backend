CREATE TABLE "product_allowed_ingredient" (
	"id" uuid PRIMARY KEY,
	"product_variant_id" uuid NOT NULL,
	"allowed_product_id" uuid,
	"allowed_category_id" uuid
);
--> statement-breakpoint
ALTER TABLE "product_allowed_ingredient" ADD CONSTRAINT "product_allowed_ingredient_7EAnhGppiMIa_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("id");--> statement-breakpoint
ALTER TABLE "product_allowed_ingredient" ADD CONSTRAINT "product_allowed_ingredient_allowed_product_id_product_id_fkey" FOREIGN KEY ("allowed_product_id") REFERENCES "product"("id");--> statement-breakpoint
ALTER TABLE "product_allowed_ingredient" ADD CONSTRAINT "product_allowed_ingredient_allowed_category_id_category_id_fkey" FOREIGN KEY ("allowed_category_id") REFERENCES "category"("id");