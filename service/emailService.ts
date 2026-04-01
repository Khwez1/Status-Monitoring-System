'use server'
// service/emailService.ts
import prisma from '@/db/prisma';
import { Resend } from 'resend';
import { Incident } from '@/generated/prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  status: "DOWN" | "DEGRADED" | "RECOVERED",
  incident: Incident
) {
  const subscribers = await prisma.subscriber.findMany();

  if (subscribers.length === 0) {
    console.log("No subscribers to notify");
    return;
  }

  const emails = subscribers.map(s => s.email);

  const subject =
    status === "DOWN" ? "🔴 Site is down" :
    status === "DEGRADED" ? "🟡 Site is degraded" :
    "🟢 Site has recovered";

  const message =
    status === "RECOVERED"
      ? `The site recovered at ${new Date().toISOString()}. It was down since ${incident.startTime.toISOString()}.`
      : `${incident.message}. Incident started at ${incident.startTime.toISOString()}.`;

  try {
    const { error } = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: emails,
      subject,
      html: `
        <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <p style="padding-top: 16px; border-top: 1px solid #e5e7eb;">
            Hi, subscriber!
          </p>
          <p>
            ${message}
            <br />
            <strong>Status:</strong>
            <span style="font-weight: bold;">
              ${status}
            </span>
          </p>
          <br />
          <p style="padding-top: 16px; border-top: 1px solid #e5e7eb;">
            Best regards,<br />Downtime
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}