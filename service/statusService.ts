"use server";
import prisma from "@/db/prisma";
import { createIncident, resolveIncident } from "./incidentService";
import { sendEmail } from "./emailService";

const MONITOR_URL = "https://httpbin.org/delay/2";
const DEGRADED_THRESHOLD_MS = 100;

export async function checkSite() {
  let currentStatus: "OPERATIONAL" | "DEGRADED" | "DOWN" = "OPERATIONAL";
  let httpStatus = 0;
  let latencyMs = 0;

  try {
    const start = Date.now();
    const res = await fetch(MONITOR_URL, {
      headers: {
        "User-Agent":
        "Mozilla/5.0 (compatible; UptimeMonitor/1.0; +https://status-monitoring-system.vercel.app)"
      }
    });
    latencyMs = Date.now() - start;
    httpStatus = res.status;

    if (!res.ok) {
      currentStatus = "DOWN";
    } else if (latencyMs > DEGRADED_THRESHOLD_MS) {
      currentStatus = "DEGRADED";
    }
  } catch {
    currentStatus = "DOWN";
  }

  // Save check record every ping
  await prisma.check.create({
    data: {
      url: MONITOR_URL,
      status: httpStatus,
      latencyMs,
      ok: currentStatus === "OPERATIONAL",
      checkedAt: new Date(),
    },
  });

  const activeIncident = await prisma.incident.findFirst({
    where: { endTime: null },
  });

  // Site just went DOWN or DEGRADED
  if (currentStatus !== "OPERATIONAL" && !activeIncident) {
    const message =
      currentStatus === "DEGRADED"
        ? "Site is responding slowly"
        : "Site is unreachable";

    const incident = await createIncident(currentStatus, message, httpStatus);
    await sendEmail(currentStatus, incident);
  }

  // Site just recovered
  if (currentStatus === "OPERATIONAL" && activeIncident) {
    const resolved = await resolveIncident(activeIncident);
    await sendEmail("RECOVERED", resolved);
  }
}
