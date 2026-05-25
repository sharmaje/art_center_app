import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendApprovalNotification, sendRejectionNotification } from "./_core/emailService";
import { syncPatientsToGoogleSheets, validateSpreadsheetAccess } from "./_core/googleSheetsService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  patients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      // Check if user is approved
      const accessRequest = await db.getAccessRequestByUserId(ctx.user.id);
      if (!accessRequest || accessRequest.status !== "approved") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access not approved" });
      }
      
      return db.getUserPatients(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        registrationNumber: z.string().optional(),
        plhivNumber: z.string().optional(),
        patientName: z.string().optional(),
        guardianName: z.string().optional(),
        contactNumber: z.string().optional(),
        residentialAddress: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Check if user is approved
        const accessRequest = await db.getAccessRequestByUserId(ctx.user.id);
        if (!accessRequest || accessRequest.status !== "approved") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access not approved" });
        }
        
        return db.createPatient({
          userId: ctx.user.id,
          registrationNumber: input.registrationNumber || null,
          plhivNumber: input.plhivNumber || null,
          patientName: input.patientName || null,
          guardianName: input.guardianName || null,
          contactNumber: input.contactNumber || null,
          residentialAddress: input.residentialAddress || null,
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Check if user is approved
        const accessRequest = await db.getAccessRequestByUserId(ctx.user.id);
        if (!accessRequest || accessRequest.status !== "approved") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access not approved" });
        }
        
        return db.deletePatient(input.id);
      }),
  }),
  
  sync: router({
    toGoogleSheets: protectedProcedure
      .input(z.object({
        spreadsheetId: z.string(),
        sheetName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Check if user is approved
        const accessRequest = await db.getAccessRequestByUserId(ctx.user.id);
        if (!accessRequest || accessRequest.status !== "approved") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access not approved" });
        }
        
        // Validate spreadsheet access
        const isValid = await validateSpreadsheetAccess(input.spreadsheetId);
        if (!isValid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid spreadsheet ID" });
        }
        
        // Get user's patients
        const patients = await db.getUserPatients(ctx.user.id);
        
        if (patients.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No patient records to sync" });
        }
        
        // Sync to Google Sheets
        const result = await syncPatientsToGoogleSheets({
          spreadsheetId: input.spreadsheetId,
          sheetName: input.sheetName || "Patients",
          patients: patients.map((p) => ({
            registrationNumber: p.registrationNumber,
            plhivNumber: p.plhivNumber,
            patientName: p.patientName,
            guardianName: p.guardianName,
            contactNumber: p.contactNumber,
            residentialAddress: p.residentialAddress,
          })),
        });
        
        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error || "Sync failed" });
        }
        
        // Log the sync operation
        await db.logGoogleSheetsSync({
          userId: ctx.user.id,
          patientCount: patients.length,
          status: "success",
          spreadsheetId: input.spreadsheetId,
          sheetName: input.sheetName || "Patients",
          syncedAt: new Date(),
        });
        
        return {
          success: true,
          message: `Successfully synced ${patients.length} patient records to Google Sheets`,
          updatedRows: result.updatedRows,
        };
      }),
  }),

  access: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      const accessRequest = await db.getAccessRequestByUserId(ctx.user.id);
      return {
        status: accessRequest?.status || "pending",
        requestedAt: accessRequest?.requestedAt,
        respondedAt: accessRequest?.respondedAt,
      };
    }),
    
    approve: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const targetUser = await db.getUserByOpenId(input.userId.toString());
        if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        await db.updateAccessRequestStatus(input.userId, "approved", ctx.user.id);
        
        // Send approval notification
        await sendApprovalNotification(targetUser.email || "", targetUser.name || "User");
        
        return { success: true };
      }),
    
    reject: adminProcedure
      .input(z.object({ userId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const targetUser = await db.getUserByOpenId(input.userId.toString());
        if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        
        await db.updateAccessRequestStatus(input.userId, "rejected", ctx.user.id, input.reason);
        
        // Send rejection notification
        await sendRejectionNotification(targetUser.email || "", targetUser.name || "User", input.reason);
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
