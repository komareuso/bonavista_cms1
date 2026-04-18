CREATE TABLE `yacht_amenities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_amenities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yacht_custom_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`fieldKey` varchar(255) NOT NULL,
	`fieldValue` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_custom_fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yacht_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`content` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yacht_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`featureKey` varchar(255) NOT NULL,
	`featureValue` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yacht_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`url` text NOT NULL,
	`storageKey` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isCover` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yachts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(120) NOT NULL,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`guestCapacity` int,
	`price` int,
	`description` text NOT NULL,
	`coverPhotoUrl` text,
	`coverPhotoKey` varchar(255),
	`createdByUserId` int,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `yachts_id` PRIMARY KEY(`id`),
	CONSTRAINT `yachts_slug_unique` UNIQUE(`slug`)
);
