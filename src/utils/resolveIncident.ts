export const resolverIncident = (
  status: "DOWN" | "DEGRADED",
  httpStatus?: number
): string => {
  if (status === "DEGRADED") {
    return "Investigating slow response times. Possible causes: high server load, network congestion.";
  }

  switch (httpStatus) {
    case 500:
      return "Server returned 500. Likely an internal application error. Check server logs.";
    case 502:
      return "Bad gateway. Upstream server may be down or misconfigured.";
    case 503:
      return "Service unavailable. Server may be overloaded or under maintenance.";
    case 504:
      return "Gateway timeout. Upstream server is not responding in time.";
    case 404:
      return "Site returned 404. The URL may have changed or the server is misconfigured.";
    case 0:
      return "No response received. Site may be completely unreachable or DNS has failed.";
    default:
      return "Site is unreachable. Investigating the cause.";
  }
}