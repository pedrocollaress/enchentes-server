import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ReportsContent } from "@/components/reports-content";
import { Footer } from "@/components/footer";

export default function Reports() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-64 flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          <ReportsContent />
        </main>

        <Footer />
      </div>
    </div>
  );
}
