import LandingPageHeader from "@/core/components/molecule/landingPage/landingPageHeader";
import { Footer } from "../core/components/molecule/Footer";
import { Hero } from "../core/components/molecule/landingPage/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingPageHeader />
      <Hero />
      <Footer />
    </div>
  );
}
