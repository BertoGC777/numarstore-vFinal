import { ReactNode } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import CartDrawer from "./CartDrawer";
import BottomNav from "./BottomNav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}<BottomNav /></main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}
