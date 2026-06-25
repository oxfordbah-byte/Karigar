const LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Accepted",
  collected: "Collected",
  washing: "Washing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const FILLED = new Set(["delivered", "completed"]);

export default function StatusBadge({ status }: { status: string }) {
  const isCancelled = status === "cancelled";
  const isFilled = FILLED.has(status);

  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${
        isCancelled
          ? "border-neutral-300 text-neutral-400 bg-neutral-50"
          : isFilled
          ? "border-[#d21f3c] bg-[#d21f3c] text-white"
          : "border-[#d21f3c] text-[#d21f3c] bg-white"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
