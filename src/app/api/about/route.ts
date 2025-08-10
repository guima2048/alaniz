import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";

export type AboutContent = {
  title: string;
  paragraphs: string[];
};

export async function GET() {
  const file = getDataFilePath("about.json");
  const data = await readJsonFile<AboutContent>(file, {
    title: "Sobre",
    paragraphs: [
      "Somos um projeto editorial focado em análises neutras de plataformas de relacionamento.",
    ],
  });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<AboutContent>;
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false }, { status: 400 });
  const next: AboutContent = {
    title: typeof body.title === "string" ? body.title : "Sobre",
    paragraphs: Array.isArray(body.paragraphs) ? body.paragraphs.map(String) : [],
  };
  await writeJsonFile(getDataFilePath("about.json"), next);
  return NextResponse.json({ ok: true });
}



