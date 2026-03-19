CREATE TABLE "branch" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_branch" (
	"discount_id" uuid,
	"branch_id" uuid,
	CONSTRAINT "discount_branch_pkey" PRIMARY KEY("discount_id","branch_id")
);
--> statement-breakpoint
CREATE TABLE "discount" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"value" bigint NOT NULL,
	"applies_to" text[] NOT NULL,
	"state" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY,
	"provider" text NOT NULL,
	"state" text NOT NULL,
	"body" text NOT NULL,
	"template_id" uuid,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_template" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_template_trigger" (
	"template_id" uuid,
	"trigger_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_template_trigger_pkey" PRIMARY KEY("template_id","trigger_id")
);
--> statement-breakpoint
CREATE TABLE "notification_table" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"event_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY,
	"order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"pricing_snapshot" bigint NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"discount_id" uuid NOT NULL,
	"total" bigint NOT NULL,
	"status" text NOT NULL,
	"note" text,
	"order_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY,
	"image" text,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"price" bigint NOT NULL,
	"image" text,
	"branch_id" uuid NOT NULL,
	"product_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" uuid PRIMARY KEY,
	"order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"satisfaction_rate" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_policy" (
	"role_id" uuid,
	"policy_id" uuid,
	CONSTRAINT "role_policy_pkey" PRIMARY KEY("role_id","policy_id")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule" (
	"id" uuid PRIMARY KEY,
	"branch_id" uuid NOT NULL,
	"from_time" time NOT NULL,
	"to_time" time NOT NULL,
	"weekday" integer NOT NULL,
	"timezone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"branch_id" uuid,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_pkey" PRIMARY KEY("branch_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "user_password" (
	"user_id" uuid PRIMARY KEY,
	"password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"role_id" uuid,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_role_pkey" PRIMARY KEY("role_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL UNIQUE,
	"email" text UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id");--> statement-breakpoint
ALTER TABLE "discount_branch" ADD CONSTRAINT "discount_branch_discount_id_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id");--> statement-breakpoint
ALTER TABLE "discount_branch" ADD CONSTRAINT "discount_branch_branch_id_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id");--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_template_id_notification_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_template"("id");--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "notification_template_trigger" ADD CONSTRAINT "notification_template_trigger_M4GZylIozoWL_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_template"("id");--> statement-breakpoint
ALTER TABLE "notification_template_trigger" ADD CONSTRAINT "notification_template_trigger_JwNEylBOHjtJ_fkey" FOREIGN KEY ("trigger_id") REFERENCES "notification_table"("id");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_branch_id_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_discount_id_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id");--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_branch_id_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id");--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id");--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id");--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_branch_id_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id");--> statement-breakpoint
ALTER TABLE "role_policy" ADD CONSTRAINT "role_policy_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id");--> statement-breakpoint
ALTER TABLE "role_policy" ADD CONSTRAINT "role_policy_policy_id_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policy"("id");--> statement-breakpoint
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_branch_id_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id");--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_branch_id_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id");--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "user_password" ADD CONSTRAINT "user_password_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id");--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");