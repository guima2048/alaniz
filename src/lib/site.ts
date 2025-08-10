import sites from "@/data/sites.json";
import cats from "@/data/categories.json";

export type SiteItem = (typeof sites)[number] & { hero?: string };

export const allSites = sites;
export const categories = cats;

export const byCategory = (slug: string) =>
  allSites.filter((s) => s.categories.includes(slug));

export const findSite = (slug: string) => allSites.find((s) => s.slug === slug);


