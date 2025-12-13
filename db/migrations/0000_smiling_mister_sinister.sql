CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`language` text(50) NOT NULL,
	`topic` text(255) NOT NULL,
	`difficulty_level` text(10) NOT NULL,
	`story_requirements` text NOT NULL,
	`status` text(20) DEFAULT 'pending' NOT NULL,
	`title` text,
	`story` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
