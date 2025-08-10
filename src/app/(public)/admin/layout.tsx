import { AdminNav } from "@/components/AdminNav";
import { AdminHelp } from "@/components/AdminHelp";

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
      <AdminHelp />
    </div>
  );
}
