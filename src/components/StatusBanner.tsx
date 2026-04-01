// components/StatusBanner.tsx
import { Check, Incident } from "@/generated/prisma/client";

interface Props {
  latestCheck: Check | null;
  activeIncident: Incident | null;
}

export const StatusBanner = ({ latestCheck, activeIncident }: Props) => {
  const status = !latestCheck
  ? "UNKNOWN"
  : activeIncident && activeIncident.status !== "RESOLVED"
  ? latestCheck.ok
    ? "DEGRADED"
    : "DOWN"
  : "OPERATIONAL";

  const config = {
    OPERATIONAL: {
      bg: "bg-green-50",
      border: "border-green-200",
      dot: "bg-green-500",
      title: "All Systems Operational",
      subtitle: "Everything is running smoothly.",
      text: "text-green-700",
    },
    DEGRADED: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      dot: "bg-yellow-500",
      title: "Degraded Performance",
      subtitle: activeIncident?.message ?? "The site is responding slowly.",
      text: "text-yellow-700",
    },
    DOWN: {
      bg: "bg-red-50",
      border: "border-red-200",
      dot: "bg-red-500",
      title: "Site is Down",
      subtitle: activeIncident?.message ?? "We are investigating the issue.",
      text: "text-red-700",
    },
    UNKNOWN: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      dot: "bg-gray-400",
      title: "No Data Yet",
      subtitle: "Waiting for first check to complete.",
      text: "text-gray-700",
    },
  }[status];

  return (
    <div className={`my-8 p-6 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-3">
        {/* Pulsing dot */}
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`} />
          <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dot}`} />
        </span>
        <h2 className={`text-xl font-bold ${config.text}`}>{config.title}</h2>
      </div>
      <p className={`mt-2 text-sm ${config.text} opacity-80`}>{config.subtitle}</p>
      {latestCheck && (
        <p className="mt-3 text-xs text-gray-400">
          Last checked: {new Date(latestCheck.checkedAt).toLocaleString()} —{" "}
          {latestCheck.latencyMs}ms response time
        </p>
      )}
    </div>
  );
};

export default StatusBanner;