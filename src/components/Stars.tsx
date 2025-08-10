"use client";

type StarProps = { filled: boolean; half?: boolean; size?: number; className?: string };

export function Star({ filled, half = false, size = 18, className }: StarProps) {
  const fill = filled ? "#f59e0b" : half ? "url(#half)" : "none";
  const stroke = filled || half ? "#f59e0b" : "#d1d5db";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      {half && (
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
      />
    </svg>
  );
}

export function StarRatingDisplay({ value }: { value: number }) {
  // value de 0..10; converter para 0..5
  const stars = Math.max(0, Math.min(5, value / 2));
  const full = Math.floor(stars);
  const hasHalf = stars - full >= 0.5;
  return (
    <div className="inline-flex items-center gap-0.5 align-middle">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < full} half={i === full && hasHalf} />
      ))}
    </div>
  );
}

type StarSelectorProps = { value: number; onChange: (v: number) => void };
// value em 1..5 (estrelas inteiras)
export function StarSelector({ value, onChange }: StarSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const v = i + 1;
        const active = v <= value;
        return (
          <button
            type="button"
            key={v}
            aria-label={`${v} estrelas`}
            onClick={() => onChange(v)}
            className="p-0.5 hover:scale-105 transition"
          >
            <Star filled={active} />
          </button>
        );
      })}
    </div>
  );
}


