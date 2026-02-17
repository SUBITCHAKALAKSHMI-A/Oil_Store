import React, { useState, useEffect } from "react";
import { Leaf, ChevronRight, ChevronLeft } from "lucide-react";
import coconutImage from "../assets/coconut.jpg";
import oliveImage from "../assets/olive.jpg";
import groundnutImage from "../assets/groundnut.jpg";
import sesameImage from "../assets/sesame.jpg";
import sunflowerImage from "../assets/sunflower.jpg";
import walnutImage from "../assets/walnut.jpg";
import almondImage from "../assets/almond.jpg";
import castorImage from "../assets/castor.jpg";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      title: "Premium Coconut Oil",
      subtitle: "Cold Pressed • 100% Organic",
      description: "Pure virgin coconut oil, perfect for high-heat cooking and baking",
      image:coconutImage,
      bgColor: "from-stone-800 via-amber-800 to-stone-900"
    },
    {
      id: 2,
      title: "Extra Virgin Olive Oil",
      subtitle: "First Cold Press • Premium Grade",
      description: "Rich in antioxidants, ideal for salads and light cooking",
      image:oliveImage,
      bgColor: "from-green-800 via-emerald-800 to-green-900"
    },
    {
      id: 3,
      title: "Pure Groundnut Oil",
      subtitle: "Traditional • Wood Pressed",
      description: "Authentic Indian groundnut oil, rich flavor for daily cooking",
      image:groundnutImage,
      bgColor: "from-amber-800 via-orange-800 to-amber-900"
    },
    {
      id: 4,
      title: "Natural Sesame Oil",
      subtitle: "Gingelly • Cold Pressed",
      description: "Pure sesame oil, perfect for South Asian cuisine and stir-fry",
      image: sesameImage,
      bgColor: "from-stone-800 via-amber-800 to-stone-900"
    },
    {
      id: 5,
      title: "Healthy Sunflower Oil",
      subtitle: "Light • Vitamin E Rich",
      description: "Light texture, ideal for frying and everyday cooking",
      image: sunflowerImage,
      bgColor: "from-yellow-800 via-amber-800 to-yellow-900"
    },
    {
      id: 6,
      title: "Premium Walnut Oil",
      subtitle: "Cold Pressed • Rich in Omega-3",
      description: "Nutty flavor, perfect for dressings and gourmet dishes",
      image: walnutImage,
      bgColor: "from-amber-800 via-orange-800 to-amber-900"
    },
    {
      id: 7,
      title: "Pure Almond Oil",
      subtitle: "Sweet Almond • Vitamin E",
      description: "Light and nutty, perfect for baking and mild cooking",
      image: almondImage,
      bgColor: "from-amber-800 via-orange-800 to-amber-900"
    },
    {
      id: 7,
      title: "Pure Almond Oil",
      subtitle: "Sweet Almond • Vitamin E",
      description: "Light and nutty, perfect for baking and mild cooking",
      image: castorImage,
      bgColor: "from-amber-800 via-orange-800 to-amber-900"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section
      className="relative overflow-hidden bg-linear-to-r from-amber-800 via-orange-800 to-amber-900 text-white"
      style={{ height: "600px" }}
    >
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-6 h-full flex items-center">
              <div className="max-w-3xl">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-0.5 bg-amber-400"></div>
                  <span className="text-amber-300 font-medium tracking-wider">
                    {slide.subtitle}
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xl mb-8 text-amber-100 max-w-2xl">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-linear-to-r from-amber-400 to-orange-400 text-amber-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-amber-700/30 hover:shadow-2xl hover:scale-105 transition flex items-center">
                    Shop Now <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                  <button className="border-2 border-white/50 backdrop-blur-sm px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition flex items-center">
                    <Leaf className="w-5 h-5 mr-2" /> Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition border border-white/30"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition border border-white/30"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;
