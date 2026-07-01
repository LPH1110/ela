import { Header, Sidebar } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[280px] min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 overflow-auto custom-scrollbar">
          <div className="container mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
