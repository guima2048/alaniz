import Link from "next/link";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";

type PostItem = {
  slug: string;
  title: string;
  excerpt?: string;
  cover?: string;
  published_at?: string;
};

export default async function BlogIndexPage() {
  const file = getDataFilePath("posts.json");
  const posts = await readJsonFile<PostItem[]>(file, []);
  const now = Date.now();
  const published = posts
    .filter((p) => !p.published_at || new Date(p.published_at).getTime() <= now)
    .sort((a, b) => (new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Blog</h1>
      {published.length === 0 ? (
        <p>Nenhum post publicado ainda.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {published.map((p) => (
            <li key={p.slug} className="rounded border bg-white p-4">
              <div className="space-y-2">
                <div className="text-xl font-medium">
                  <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                </div>
                {p.excerpt ? <p className="text-neutral-700">{p.excerpt}</p> : null}
                <div className="text-xs text-neutral-500">/{p.slug}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
