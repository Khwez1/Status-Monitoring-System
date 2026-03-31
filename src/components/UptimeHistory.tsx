// components/UptimeHistory.tsx
import { Check } from "@/generated/prisma/client";

interface Props {
  checks: Check[];
}

const UptimeHistory = ({ checks }: Props) => {
  const BLOCKS = 48; // 48 blocks = 30 min each over 24hrs

  // Split checks into blocks
  const now = Date.now();
  const windowMs = (24 * 60 * 60 * 1000) / BLOCKS;

  const blocks = Array.from({ length: BLOCKS }, (_, i) => {
    const blockStart = now - (BLOCKS - i) * windowMs;
    const blockEnd = blockStart + windowMs;

    const blockChecks = checks.filter((c) => {
      const t = new Date(c.checkedAt).getTime();
      return t >= blockStart && t < blockEnd;
    });

    if (blockChecks.length === 0) return "EMPTY";

    const hasDown = blockChecks.some((c) => !c.ok && c.latencyMs === 0);
    const hasDegraded = blockChecks.some(
      (c) => c.ok && c.latencyMs > 1000
    );

    if (hasDown) return "DOWN";
    if (hasDegraded) return "DEGRADED";
    return "OPERATIONAL";
  });

  // Calculate uptime percentage
  const nonEmptyBlocks = blocks.filter((b) => b !== "EMPTY");
  const uptimePercent =
    nonEmptyBlocks.length === 0
      ? null
      : Math.round(
          (nonEmptyBlocks.filter((b) => b === "OPERATIONAL").length /
            nonEmptyBlocks.length) *
            1000
        ) / 10;

  const colorMap = {
    OPERATIONAL: "bg-green-500",
    DEGRADED: "bg-yellow-400",
    DOWN: "bg-red-500",
    EMPTY: "bg-gray-200",
  };

  const tooltipMap = {
    OPERATIONAL: "Operational",
    DEGRADED: "Degraded",
    DOWN: "Down",
    EMPTY: "No data",
  };

  return (
    <div className="my-8 bg-white rounded-lg border border-gray-200 shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-600">
          Uptime last 24 hours
        </h2>
        {uptimePercent !== null && (
          <span className="text-sm font-bold text-green-600">
            {uptimePercent}% uptime
          </span>
        )}
      </div>

      {/* Blocks */}
      <div className="flex items-end gap-0.5">
        {blocks.map((status, i) => (
          <div key={i} className="group relative flex-1">
            <div
              className={`h-8 rounded-sm ${colorMap[status]} transition-opacity hover:opacity-75`}
            />
            {/* Tooltip */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              {tooltipMap[status]}
            </div>
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">24 hours ago</span>
        <span className="text-xs text-gray-400">Now</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4">
        {[
          { color: "bg-green-500", label: "Operational" },
          { color: "bg-yellow-400", label: "Degraded" },
          { color: "bg-red-500", label: "Down" },
          { color: "bg-gray-200", label: "No data" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UptimeHistory;