type Props = {
  avg: number;
  count: number;
};

export function RatingBadge({ avg, count }: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-black text-white px-3 py-1 text-xs font-medium shadow-sm">
      <span className="font-bold">{(avg || 0).toFixed(1)}</span>
      <span className="opacity-90">({count || 0})</span>
    </div>
  );
}


