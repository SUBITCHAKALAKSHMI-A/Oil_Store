import React from "react";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import Features from "../components/Features";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/30 to-amber-50/30">
      <Navbar />
      <HeroCarousel />
      <Features />
      <Categories />
      <FeaturedProducts />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default HomePage;
