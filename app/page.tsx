import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import AboutCardapio from "@/components/landing/AboutCardapio";
import Features from "@/components/landing/Features";
import PlaceholderSection from "@/components/landing/PlaceholderSection";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <AboutCardapio />
        <Features />
        {/* <PlaceholderSection id="pedidos-mesa" title="Pedidos na Mesa" />
        <PlaceholderSection
          id="pedidos-whatsapp"
          title="Pedidos via WhatsApp"
        /> */}
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
