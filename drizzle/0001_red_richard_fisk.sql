CREATE TABLE `accessRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`respondedAt` timestamp,
	`respondedBy` int,
	`reason` text,
	CONSTRAINT `accessRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `accessRequests_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `googleSheetsSyncLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patientCount` int NOT NULL,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`spreadsheetId` varchar(255),
	`sheetName` varchar(255),
	`syncedAt` timestamp,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `googleSheetsSyncLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`registrationNumber` varchar(100),
	`plhivNumber` varchar(100),
	`patientName` varchar(255),
	`guardianName` varchar(255),
	`contactNumber` varchar(20),
	`residentialAddress` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
