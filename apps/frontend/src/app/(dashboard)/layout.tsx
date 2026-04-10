import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireAuthenticatedUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await requireAuthenticatedUser();

  return (
    <div className="min-h-screen bg-transparent lg:flex">
      <Sidebar currentUser={currentUser} />
      <div className="flex-1">
        <Header currentUser={currentUser} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
