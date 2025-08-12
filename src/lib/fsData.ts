import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

const dataDir = path.join(rootDir, "src", "data");

function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getDataFilePath(fileName: "categories.json" | "sites.json" | "ratings.json" | "about.json" | "posts.json" | "comments.json") {
  ensureDirSync(dataDir);
  return path.join(dataDir, fileName);
}

export async function readJsonFile<T = unknown>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fsp.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  await fsp.writeFile(filePath, json, "utf8");
}

export async function getSites() {
  const filePath = getDataFilePath("sites.json");
  return await readJsonFile(filePath, []);
}

export async function updateSite(slug: string, updates: Record<string, unknown>) {
  const sites = await getSites();
  const siteIndex = sites.findIndex((site: Record<string, unknown>) => site.slug === slug);
  
  if (siteIndex !== -1) {
    (sites as Record<string, unknown>[])[siteIndex] = { ...(sites[siteIndex] as Record<string, unknown>), ...updates };
    const filePath = getDataFilePath("sites.json");
    await writeJsonFile(filePath, sites);
  }
  
  return sites[siteIndex];
}


