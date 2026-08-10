/** "Deadline Sat 12:30" style formatting for a gameweek deadline timestamp. */
export function formatDeadline(deadlineTime: string | Date | null | undefined): string | null {
  if (!deadlineTime) return null;
  const date = new Date(deadlineTime);
  if (Number.isNaN(date.getTime())) return null;

  const day = date.toLocaleDateString(undefined, { weekday: 'short' });
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day} ${time}`;
}
