const PATHS: Record<string, string> = {
  "laundry-ironing":
    "M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 3v2m6-2v2M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 7h.01M11 7h.01",
  "home-cleaning":
    "M4 12 12 5l8 7M6 11v8h12v-8M10 19v-4h4v4",
  "deep-cleaning":
    "M5 19h14M7 19V9l5-5 5 5v10M9 19v-6h6v6",
  plumbing:
    "M7 4h4v4l-3 3v6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v-2m-7-8h4m6 0h2v5h-2z",
  electrical: "M13 3 4 14h6l-1 7 9-11h-6z",
  carpentry:
    "M3 17 14 6l4 4-11 11H3v-4zM14 6l2-2 4 4-2 2",
  painting:
    "M12 3c4 0 7 2 7 5 0 2-1.5 3-3.5 3H14c-1 0-1.5.6-1.5 1.4 0 1 .8 1.6 0 2.6-1 1.3-3.3 1-4.5-.3C6.6 13.2 5 11 5 8c0-3 3-5 7-5z",
  "ac-services":
    "M12 2v20M5 6l14 12M19 6 5 18M2 12h20",
  "appliance-repair":
    "M5 4h14v16H5zM8 8h8M8 12h8M8 16h3m6-13 3 3-3 3",
  "garden-services":
    "M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10zM12 13v-3m0 0c0-2 1-3 3-3M12 10c0-2-1-3-3-3",
  handyman:
    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1a5 5 0 0 1-6.6 6.6l-7 7a2 2 0 0 1-3-3l7-7a5 5 0 0 1 6.6-6.6z",
};

const FALLBACK =
  "M4 7h16M4 12h16M4 17h16";

export default function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const d = PATHS[slug] ?? FALLBACK;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
