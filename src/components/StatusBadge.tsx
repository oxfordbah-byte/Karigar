const LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: string }) {
  const isCancelled = status === "cancelled";
  const isCompleted = status === "completed";

  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${
        isCancelled
          ? "border-neutral-300 text-neutral-400 bg-neutral-50"
          : isCompleted
          ? "border-black bg-black text-white"
          : "border-black text-black bg-white"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
