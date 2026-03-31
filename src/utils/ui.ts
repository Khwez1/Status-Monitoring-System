export const getStatusClass = (status: string) => {
  switch (status) {
    case "INVESTIGATING":
      return "text-red-600 font-bold";
    case "IDENTIFIED":
      return "text-orange-600 font-bold";
    case "MONITORING":
      return "text-yellow-600 font-bold";
    case "RESOLVED":
      return "text-green-600 font-bold";
    default:
      return "text-gray-600 font-bold";
  }
};