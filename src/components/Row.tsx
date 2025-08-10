"use client";
import { useRef } from "react";
import { Card } from "./Card";
import type { SiteItem } from "@/lib/site";

type Props = {
  title: string;
  sites: SiteItem[];
};

export function Row({ title, sites }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  if (!sites || sites.length === 0) return null;
  const scrollByAmount = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };
  return (
    <section className="space-y-3 group">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-p-4 pb-2"
        >
          {sites.map((s) => (
            <Card key={s.slug} item={s} />
          ))}
        </div>
        <button
          aria-label="Scroll esquerda"
          onClick={() => scrollByAmount(-320)}
          className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border border-neutral-200 shadow-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
        >
          ◀
        </button>
        <button
          aria-label="Scroll direita"
          onClick={() => scrollByAmount(320)}
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border border-neutral-200 shadow-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
        >
          ▶
        </button>
      </div>
    </section>
  );
}

