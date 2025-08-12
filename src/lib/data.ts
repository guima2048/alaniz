import type { SiteItem } from "./site";
import sites from "@/data/sites.json";
import categories from "@/data/categories.json";

export async function getSites(): Promise<SiteItem[]> {
  return sites;
}

export async function getCategories(): Promise<typeof categories> {
  return categories;
}
