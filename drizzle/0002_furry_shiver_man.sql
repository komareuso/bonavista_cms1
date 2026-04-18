CREATE TABLE `yacht_equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_equipment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yacht_extra_fees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`feeType` varchar(80),
	`label` varchar(255) NOT NULL,
	`pricingModel` varchar(80),
	`amount` int,
	`currency` varchar(8) DEFAULT 'EUR',
	`unitLabel` varchar(80),
	`notes` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_extra_fees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yacht_included_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_included_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yacht_pricing_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yachtId` int NOT NULL,
	`seasonLabel` varchar(160) NOT NULL,
	`minHours` int,
	`minGuests` int,
	`maxGuests` int,
	`price` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'EUR',
	`notes` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `yacht_pricing_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `yachts` ADD `marinaName` varchar(255);--> statement-breakpoint
ALTER TABLE `yachts` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `yachts` ADD `country` varchar(120);--> statement-breakpoint
ALTER TABLE `yachts` ADD `berthLocationText` text;--> statement-breakpoint
ALTER TABLE `yachts` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `yachts` ADD `longitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `yachts` ADD `rentalType` varchar(120);--> statement-breakpoint
ALTER TABLE `yachts` ADD `captainIncluded` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `yachts` ADD `crewIncluded` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `yachts` ADD `minimumOrderHours` int;--> statement-breakpoint
ALTER TABLE `yachts` ADD `minimumOrderUnit` varchar(24) DEFAULT 'hours';--> statement-breakpoint
ALTER TABLE `yachts` ADD `lengthValue` decimal(8,2);--> statement-breakpoint
ALTER TABLE `yachts` ADD `lengthUnit` varchar(16);--> statement-breakpoint
ALTER TABLE `yachts` ADD `beamValue` decimal(8,2);--> statement-breakpoint
ALTER TABLE `yachts` ADD `beamUnit` varchar(16);--> statement-breakpoint
ALTER TABLE `yachts` ADD `draftValue` decimal(8,2);--> statement-breakpoint
ALTER TABLE `yachts` ADD `draftUnit` varchar(16);--> statement-breakpoint
ALTER TABLE `yachts` ADD `yearBuilt` int;--> statement-breakpoint
ALTER TABLE `yachts` ADD `modelName` varchar(160);--> statement-breakpoint
ALTER TABLE `yachts` ADD `boatCategory` varchar(160);--> statement-breakpoint
ALTER TABLE `yachts` ADD `internalReferenceId` varchar(80);--> statement-breakpoint
ALTER TABLE `yachts` ADD `toiletsCount` int;--> statement-breakpoint
ALTER TABLE `yachts` ADD `engineSpec` varchar(160);--> statement-breakpoint
ALTER TABLE `yachts` ADD `cruisingSpeedValue` decimal(8,2);--> statement-breakpoint
ALTER TABLE `yachts` ADD `cruisingSpeedUnit` varchar(16);--> statement-breakpoint
ALTER TABLE `yachts` ADD `currency` varchar(8) DEFAULT 'EUR';--> statement-breakpoint
ALTER TABLE `yachts` ADD `pricingMode` enum('fixed','tiered') DEFAULT 'fixed' NOT NULL;--> statement-breakpoint
ALTER TABLE `yachts` ADD `basePriceLabel` varchar(160);--> statement-breakpoint
ALTER TABLE `yachts` ADD `vatIncluded` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `yachts` ADD `vatRate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `yachts` ADD `pricingNotes` text;--> statement-breakpoint
ALTER TABLE `yachts` ADD `heroBadge` varchar(160);--> statement-breakpoint
ALTER TABLE `yachts` ADD `shortLocationLabel` varchar(255);--> statement-breakpoint
ALTER TABLE `yachts` ADD `ctaPrimaryLabel` varchar(120);--> statement-breakpoint
ALTER TABLE `yachts` ADD `ctaSecondaryLabel` varchar(120);--> statement-breakpoint
ALTER TABLE `yachts` ADD `bookingHelpText` text;--> statement-breakpoint
ALTER TABLE `yachts` ADD `extraServiceNotes` text;--> statement-breakpoint
ALTER TABLE `yachts` ADD `serviceStaffRatioText` text;--> statement-breakpoint
ALTER TABLE `yachts` ADD `smokingAllowed` int;--> statement-breakpoint
ALTER TABLE `yachts` ADD `petsAllowed` int;--> statement-breakpoint
ALTER TABLE `yachts` ADD `partyAllowed` int;--> statement-breakpoint
ALTER TABLE `yachts` ADD `childrenAllowed` int;--> statement-breakpoint
ALTER TABLE `yachts` ADD `rulesNotes` text;--> statement-breakpoint
ALTER TABLE `yachts` ADD `reviewsEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `yachts` ADD `reviewCount` int;--> statement-breakpoint
ALTER TABLE `yachts` ADD `verifiedReviewsOnly` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `yachts` ADD `similarBoatsEnabled` int DEFAULT 0 NOT NULL;