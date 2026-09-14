CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`buyer_hash` text NOT NULL,
	`map_id` text NOT NULL,
	`friend_id` text NOT NULL,
	`amount` integer NOT NULL,
	`mode` text NOT NULL,
	`status` text NOT NULL,
	`payment_key` text,
	`report` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_purchase` ON `orders` (`buyer_hash`,`map_id`,`friend_id`,`mode`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_payment` ON `orders` (`payment_key`);