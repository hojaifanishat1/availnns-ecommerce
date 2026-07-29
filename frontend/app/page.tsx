import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSeller from "@/components/home/BestSeller";
import NewArrivals from "@/components/home/NewArrivals";
import DealProducts from "@/components/home/DealProducts";


export default function HomePage() {
  return (
    <div className="pt-12 sm:pt-16">
      <Hero />

      <NewArrivals />

      <BestSeller />

      <FeaturedProducts />

      <DealProducts />
    </div>
  );
}
