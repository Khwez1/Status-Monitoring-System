// service/incidentService.ts
"use server";
import prisma from "@/db/prisma";
import { Incident } from "@/generated/prisma/client";
import { resolverIncident } from "@/utils/resolveIncident";

export async function createIncident(
  status: "DOWN" | "DEGRADED",
  message: string,
  httpStatus?: number,
) {
  const resolution = resolverIncident(status, httpStatus);

  return await prisma.incident.create({
    data: {
      status: "INVESTIGATING",
      message,
      resolution,
      startTime: new Date(),
    },
  });
}

export async function resolveIncident(incident: Incident) {
  const durationMs =
    new Date().getTime() - new Date(incident.startTime).getTime();
  const durationMin = Math.round(durationMs / 1000 / 60);

  const resolution =
    incident.status === "INVESTIGATING"
      ? `Site recovered automatically after ${durationMin} minute${durationMin === 1 ? "" : "s"}. Root cause under review.`
      : `Resolved after ${durationMin} minute${durationMin === 1 ? "" : "s"}.`;

  return await prisma.incident.update({
    where: { id: incident.id },
    data: {
      status: "RESOLVED",
      endTime: new Date(),
      resolution,
    },
  });
}

export async function getIncidents() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
    });
    return incidents;
  } catch (error) {
    throw new Error(`Error fetching incidents: ${error}`);
  }
}

export async function getIncidentById(id: string) {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id },
    });
    if (!incident) {
      throw new Error(`Incident not found: ${id}`);
    }
    return incident;
  } catch (error) {
    throw new Error(`Error fetching incident: ${error}`);
  }
}
