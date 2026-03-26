CREATE TABLE "loyalty_card" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"current_balance" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_transaction" (
	"id" uuid PRIMARY KEY,
	"loyalty_card_id" uuid NOT NULL,
	"order_id" uuid,
	"value" bigint NOT NULL,
	"transaction_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_redemption" (
	"id" uuid PRIMARY KEY,
	"reward_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"cost" bigint NOT NULL,
	"discount_id" uuid NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discount" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "discount" ADD COLUMN "max_uses" integer;--> statement-breakpoint
ALTER TABLE "discount" ADD COLUMN "current_uses" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "discount" ADD COLUMN "is_active" text DEFAULT 'true';--> statement-breakpoint
ALTER TABLE "discount" ADD COLUMN "hidden" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "loyalty_card" ADD CONSTRAINT "loyalty_card_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "loyalty_transaction" ADD CONSTRAINT "loyalty_transaction_loyalty_card_id_loyalty_card_id_fkey" FOREIGN KEY ("loyalty_card_id") REFERENCES "loyalty_card"("id");--> statement-breakpoint
ALTER TABLE "loyalty_transaction" ADD CONSTRAINT "loyalty_transaction_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id");--> statement-breakpoint
ALTER TABLE "reward_redemption" ADD CONSTRAINT "reward_redemption_reward_id_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "reward"("id");--> statement-breakpoint
ALTER TABLE "reward_redemption" ADD CONSTRAINT "reward_redemption_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "reward_redemption" ADD CONSTRAINT "reward_redemption_branch_id_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id");--> statement-breakpoint
ALTER TABLE "reward" ADD CONSTRAINT "reward_discount_id_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discount"("id");