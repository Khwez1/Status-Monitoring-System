import { getIncidentById } from "@/../service/incidentService";
import { notFound } from "next/navigation";
import { getStatusClass } from "@/utils/ui";
import { formatDateTime, formatDuration } from "@/utils/date";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

const IncidentDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const incident = await getIncidentById(id);

  if (!incident) {
    notFound();
  }

  const isOngoing = !incident.endTime;

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow border border-gray-200 p-8 space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">Incident Report</h1>

        {/* Badge */}
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${
            isOngoing
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {isOngoing ? "Ongoing" : "Resolved"}
        </span>

        {/* Message */}
        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">What happened</h2>
          <p>{incident.message}</p>
        </div>

        {/* Status */}
        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-2">Status</h2>
          <p className={getStatusClass(incident.status)}>{incident.status}</p>
        </div>

        {/* Timeline */}
        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-1">Timeline</h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Started: </span>
              {formatDateTime(incident.startTime)}
            </p>
            <p>
              <span className="font-medium">Ended: </span>
              {incident.endTime
                ? formatDateTime(incident.endTime)
                : "Still ongoing"}
            </p>
            {incident.endTime && (
              <p>
                <span className="font-medium">Duration: </span>
                {formatDuration(incident.startTime, incident.endTime)}
              </p>
            )}
          </div>
        </div>

        {/* Resolution */}
        <div className="text-gray-700">
          <h2 className="text-lg font-semibold mb-1">Resolution</h2>
          <p>{incident.resolution ?? "Under investigation."}</p>
        </div>

        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ← Back to incidents
        </Link>
      </div>
    </div>
  );
};

export default IncidentDetailPage;