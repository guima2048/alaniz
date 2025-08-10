import { AdminNav } from "@/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}
