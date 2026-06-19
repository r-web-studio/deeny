import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar />
      <main className="md:pl-64 p-4 md:p-6 pt-4">
        {children}
      </main>
    </div>
  );
}
