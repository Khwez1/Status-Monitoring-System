'use server'
// service/emailService.ts
import prisma from '@/db/prisma';
import { Resend } from 'resend';
import { Incident } from '@/generated/prisma/client';
import { EmailTemplate } from '@/components/EmailTemplate';

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
      react: EmailTemplate({
        message,
        status: status
      })
    });

    if (error) {
      console.error("Email error:", error);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}