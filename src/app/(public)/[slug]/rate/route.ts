import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";

type RatingItem = { slug: string; score: number; count: number };

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { score } = (await req.json().catch(() => ({}))) as { score?: number };
  if (typeof score !== "number" || score < 0 || score > 10) return NextResponse.json({ ok: false }, { status: 400 });
  const file = getDataFilePath("ratings.json");
  const list = await readJsonFile<RatingItem[]>(file, []);
  const existing = list.find((r) => r.slug === slug);
  if (!existing) {
    list.push({ slug, score, count: 1 });
  } else {
    const total = existing.score * existing.count + score;
    existing.count += 1;
    existing.score = Number((total / existing.count).toFixed(2));
  }
  await writeJsonFile(file, list);
  return NextResponse.json({ ok: true });
}


