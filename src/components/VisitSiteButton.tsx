"use client";

type Props = {
  url: string;
  slug: string;
  name: string;
  className?: string;
  children?: React.ReactNode;
};

export function VisitSiteButton({ url, slug, name, className, children }: Props) {
  const handleClick = () => {
    if (
      typeof window !== "undefined" &&
      (window as unknown as { dataLayer?: Array<Record<string, unknown>> }).dataLayer
    ) {
      (window as unknown as { dataLayer?: Array<Record<string, unknown>> }).dataLayer!.push({
        event: "outbound_click",
        site_slug: slug,
        site_name: name,
      });
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className={className ?? "rounded-md bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800"}
      rel="nofollow sponsored noopener"
    >
      {children ?? "Visitar Site"}
    </button>
  );
}

