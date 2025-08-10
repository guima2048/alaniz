export function getBaseUrl(): string {
  if (typeof window !== "undefined") return ""; // Browser should use relative path
  
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  return `http://localhost:${port}`;
}


