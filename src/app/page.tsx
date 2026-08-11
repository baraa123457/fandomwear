import { Hero } from "@/components/home/hero";
import { UniverseMarquee } from "@/components/home/marquee";
import { Collections } from "@/components/home/collections";
import { Trending } from "@/components/home/trending";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewArrivals } from "@/components/home/new-arrivals";
import { BestSellers } from "@/components/home/best-sellers";
import { Newsletter } from "@/components/home/newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <UniverseMarquee />
      <Collections />
      <Trending />
      <FeaturedProducts />
      <NewArrivals />
      <BestSellers />
      <Newsletter />
    </>
  );
}
