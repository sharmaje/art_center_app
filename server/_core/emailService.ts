import { ENV } from "./env";
import { notifyOwner } from "./notification";

const ADMIN_EMAIL = "NEELUSHA@GMAIL.COM";

/**
 * Send email notification to admin about new access request
 */
export async function sendAccessRequestNotification(
  userEmail: string,
  userName: string
): Promise<boolean> {
  try {
    const title = "New Access Request - HIV Paeds CHK";
    const content = `A new user has requested access to the HIV Paeds CHK system:\n\nEmail: ${userEmail}\nName: ${userName}\n\nPlease log in to the admin panel to approve or reject this request.`;
    
    return await notifyOwner({ title, content });
  } catch (error) {
    console.error("[EmailService] Failed to send access request notification:", error);
    return false;
  }
}

/**
 * Send email notification to user about approval
 * Note: This uses the owner notification system as a fallback
 * In production, you would integrate with a real email service like SendGrid, AWS SES, etc.
 */
export async function sendApprovalNotification(
  userEmail: string,
  userName: string
): Promise<boolean> {
  try {
    const title = "Access Approved - HIV Paeds CHK";
    const content = `Dear ${userName},\n\nYour access request to the HIV Paeds CHK system has been APPROVED.\n\nYou can now log in and start managing pediatric ART patient records.\n\nBest regards,\nHIV Paeds CHK Admin`;
    
    // In production, send directly to userEmail via SendGrid/SES
    // For now, notify owner as fallback
    return await notifyOwner({ title, content });
  } catch (error) {
    console.error("[EmailService] Failed to send approval notification:", error);
    return false;
  }
}

/**
 * Send email notification to user about rejection
 */
export async function sendRejectionNotification(
  userEmail: string,
  userName: string,
  reason?: string
): Promise<boolean> {
  try {
    const title = "Access Request Denied - HIV Paeds CHK";
    const reasonText = reason ? `\n\nReason: ${reason}` : "";
    const content = `Dear ${userName},\n\nYour access request to the HIV Paeds CHK system has been REJECTED.${reasonText}\n\nIf you believe this is an error, please contact the system administrator.\n\nBest regards,\nHIV Paeds CHK Admin`;
    
    // In production, send directly to userEmail via SendGrid/SES
    // For now, notify owner as fallback
    return await notifyOwner({ title, content });
  } catch (error) {
    console.error("[EmailService] Failed to send rejection notification:", error);
    return false;
  }
}
