import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import clsx from "clsx";

/**
 * Formats a date to a human-friendly string.
 */
export const formatDate = (date) => {
  if (!date) return "No due date";
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d, yyyy");
};

/**
 * Returns relative time string (e.g. "2 hours ago").
 */
export const timeAgo = (date) => {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Returns true if a task's dueDate is past and status is not done.
 */
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === "done") return false;
  return isPast(new Date(dueDate));
};

/**
 * Merges class names conditionally.
 */
export const cn = (...inputs) => clsx(inputs);

/**
 * Extracts error message from Axios error.
 */
export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong.";

/**
 * Returns initials from a name string.
 */
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Truncates a string to maxLength and appends ellipsis.
 */
export const truncate = (str = "", maxLength = 60) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;

