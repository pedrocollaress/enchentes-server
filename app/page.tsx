import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MainContent } from "@/components/main-content";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-64 flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          <MainContent />
        </main>

        <Footer />
      </div>
    </div>
  );
}
