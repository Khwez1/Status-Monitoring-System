import Link from "next/link";
import { Incident } from "@/generated/prisma/client";
import { getStatusClass } from "@/utils/ui";

interface Props {
    incidents: Incident[]
}

const IncidentsList = ({incidents}: Props) => {
  console.log(incidents);

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      {incidents.length === 0 ? (
        <p className="text-center text-gray-600"></p>
      ) : (
        <div className="space-y-4 w-full mx-auto">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex justify-between items-center bg-white rounded-lg shadow border border-gray-200 p-6"
            >
              {/* Left Side */}
              <div>
                <h2 className="text-xl font-semibold text-blue-600">
                  {incident.message}
                </h2>
                <p className="font-semibold text-gray-600">
                  {new Date(incident.createdAt).toLocaleString()}
                </p>
              </div>
              {/* Right Side */}
              <div className="text-right space-y-2">
                <div className="text-sm text-gray-500">
                  Status: <span className={getStatusClass(incident.status)}>{incident.status}</span>
                </div>
                <Link
                  href={`/incident/${incident.id}`}
                  className="inline-block mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition text-center"
                >
                  View Incident
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsList;
