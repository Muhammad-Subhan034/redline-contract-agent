import Hero from "@/components/Hero";
import ProcessSection from "@/components/ProcessSection";
import FeatureGrid from "@/components/FeatureGrid";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <ProcessSection />
        <FeatureGrid />
      </main>
      <Footer />
    </>
  );
}
