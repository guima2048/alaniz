import type { Metadata } from "next";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";

type Params = { slug: string };

type PostItem = {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  cover?: string;
  published_at?: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const file = getDataFilePath("posts.json");
  const posts = await readJsonFile<PostItem[]>(file, []);
  const post = posts.find((p) => p.slug === slug);
  return {
    title: post?.title ?? "Post",
    description: post?.excerpt,
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const file = getDataFilePath("posts.json");
  const posts = await readJsonFile<PostItem[]>(file, []);
  const post = posts.find((p) => p.slug === slug);
  if (!post) return <div className="container mx-auto px-4 py-8">Não encontrado.</div>;
  const now = Date.now();
  const publishTs = post.published_at ? new Date(post.published_at).getTime() : 0;
  if (publishTs > now) return <div className="container mx-auto px-4 py-8">Post agendado.</div>;
  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-3xl font-semibold">{post.title}</h1>
      {post.excerpt ? <p className="text-neutral-700">{post.excerpt}</p> : null}
      {post.cover ? <img src={post.cover} alt={post.title} className="w-full max-h-96 object-cover rounded" /> : null}
      <article className="prose max-w-none whitespace-pre-wrap">{post.content}</article>
    </div>
  );
}
