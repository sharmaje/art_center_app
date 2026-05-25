import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Patients table for pediatric ART records
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users
  registrationNumber: varchar("registrationNumber", { length: 100 }),
  plhivNumber: varchar("plhivNumber", { length: 100 }),
  patientName: varchar("patientName", { length: 255 }),
  guardianName: varchar("guardianName", { length: 255 }),
  contactNumber: varchar("contactNumber", { length: 20 }),
  residentialAddress: text("residentialAddress"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Access requests table for tracking user approval status
 */
export const accessRequests = mysqlTable("accessRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // Foreign key to users
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
  respondedBy: int("respondedBy"), // Admin user ID who approved/rejected
  reason: text("reason"), // Reason for rejection if applicable
});

export type AccessRequest = typeof accessRequests.$inferSelect;
export type InsertAccessRequest = typeof accessRequests.$inferInsert;

/**
 * Google Sheets sync log for tracking sync operations
 */
export const googleSheetsSyncLog = mysqlTable("googleSheetsSyncLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientCount: int("patientCount").notNull(),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  spreadsheetId: varchar("spreadsheetId", { length: 255 }),
  sheetName: varchar("sheetName", { length: 255 }),
  syncedAt: timestamp("syncedAt"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GoogleSheetsSyncLog = typeof googleSheetsSyncLog.$inferSelect;
export type InsertGoogleSheetsSyncLog = typeof googleSheetsSyncLog.$inferInsert;