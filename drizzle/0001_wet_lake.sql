CREATE TABLE `friends` (
	`id` text PRIMARY KEY NOT NULL,
	`map_id` text NOT NULL,
	`nickname` text NOT NULL,
	`mbti` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_friends_map_nickname_mbti` ON `friends` (`map_id`,`nickname`,`mbti`);