ALTER TABLE `user` ADD `is_admin` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `can_create_story` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `can_create_audio` integer DEFAULT false NOT NULL;