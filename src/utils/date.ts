import { format, formatDistanceToNow } from "date-fns";

export const formatDateTime = (date: Date | string) => {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
};

export const formatRelative = (date: Date | string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDuration = (start: Date | string, end: Date | string) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.round(ms / 1000 / 60);
  if (minutes < 1) return "less than a minute";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
};