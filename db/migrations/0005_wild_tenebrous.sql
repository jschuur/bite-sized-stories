CREATE TABLE `languages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`language_code` text NOT NULL,
	`google_cloud_tts` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `languages_language_code_unique` ON `languages` (`language_code`);--> statement-breakpoint
CREATE TABLE `story_requirement_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`template` text NOT NULL,
	`options` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `story_requirement_categories_key_unique` ON `story_requirement_categories` (`key`);--> statement-breakpoint
CREATE TABLE `topic_ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`topic` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
