// app/page.tsx
import prisma from "@/db/prisma";
import IncidentsList from "@/components/IncidentsList";
import StatusBanner from "@/components/StatusBanner";
import StatusHeader from "@/components/StatusHeader";
import { getIncidents } from "../../service/incidentService";
import UptimeHistory from "@/components/UptimeHistory";

export const revalidate = 30;

const HomePage = async () => {
  const incidents = await getIncidents();

  const latestCheck = await prisma.check.findFirst({
    orderBy: { checkedAt: "desc" },
  });

  const activeIncident = await prisma.incident.findFirst({
    where: { endTime: null },
  });

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const checks = await prisma.check.findMany({
    where: { checkedAt: { gte: twentyFourHoursAgo } },
    orderBy: { checkedAt: "asc" },
  });

  
  return (
    <div className="relative container mx-auto p-6">
      <StatusHeader />
      <UptimeHistory checks={checks} />
      <StatusBanner latestCheck={latestCheck} activeIncident={activeIncident} />
      <IncidentsList incidents={incidents} />
    </div>
  );
};

export default HomePage;
