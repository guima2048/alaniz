type Props = {
  avg: number;
  count: number;
};

export function RatingBadge({ avg, count }: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-neutral-900 text-white px-2 py-0.5 text-xs">
      <span className="font-semibold">{(avg || 0).toFixed(1)}</span>
      <span className="opacity-80">({count || 0})</span>
    </div>
  );
}


