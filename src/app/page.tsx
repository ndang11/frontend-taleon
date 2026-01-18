import { FeaturedPosts } from "./components/FeaturedPosts";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navigation } from "./components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />
      <main>
        <Hero />
        <FeaturedPosts />
      </main>
      <Footer />
    </div>
  );
}
