import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, patients, accessRequests, googleSheetsSyncLog, InsertPatient, InsertGoogleSheetsSyncLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all patients for a specific user
 */
export async function getUserPatients(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select().from(patients).where(eq(patients.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get user patients:", error);
    return [];
  }
}

/**
 * Create a new patient record
 */
export async function createPatient(data: InsertPatient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(patients).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create patient:", error);
    throw error;
  }
}

/**
 * Delete a patient record
 */
export async function deletePatient(patientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.delete(patients).where(eq(patients.id, patientId));
  } catch (error) {
    console.error("[Database] Failed to delete patient:", error);
    throw error;
  }
}

/**
 * Get or create access request for a user
 */
export async function getOrCreateAccessRequest(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const existing = await db.select().from(accessRequests).where(eq(accessRequests.userId, userId)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    
    // Create new access request
    const result = await db.insert(accessRequests).values({ userId });
    const created = await db.select().from(accessRequests).where(eq(accessRequests.userId, userId)).limit(1);
    return created[0];
  } catch (error) {
    console.error("[Database] Failed to get/create access request:", error);
    throw error;
  }
}

/**
 * Update access request status
 */
export async function updateAccessRequestStatus(
  userId: number,
  status: 'approved' | 'rejected',
  adminId?: number,
  reason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.update(accessRequests)
      .set({
        status,
        respondedAt: new Date(),
        respondedBy: adminId,
        reason,
      })
      .where(eq(accessRequests.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to update access request:", error);
    throw error;
  }
}

/**
 * Get access request by user ID
 */
export async function getAccessRequestByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(accessRequests).where(eq(accessRequests.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get access request:", error);
    return null;
  }
}

/**
 * Log Google Sheets sync operation
 */
export async function logGoogleSheetsSync(data: InsertGoogleSheetsSyncLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(googleSheetsSyncLog).values(data);
  } catch (error) {
    console.error("[Database] Failed to log sync:", error);
    throw error;
  }
}
