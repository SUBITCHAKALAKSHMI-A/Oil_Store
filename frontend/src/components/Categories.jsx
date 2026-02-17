import React from "react";
import { Droplet, Wheat, Flame } from "lucide-react";
import coconutImage from "../assets/coconut.jpg";
import oliveImage from "../assets/olive.jpg";
import groundnutImage from "../assets/groundnut.jpg";
import sesameImage from "../assets/sesame.jpg";
import sunflowerImage from "../assets/sunflower.jpg";
import walnutImage from "../assets/walnut.jpg";
import almondImage from "../assets/almond.jpg";
import castorImage from "../assets/castor.jpg";

const Categories = () => {
  const categories = [
    { name: "Olive Oil", icon: <Droplet className="w-6 h-6" />, color: "from-green-50 to-green-100", textColor: "text-green-700", image: oliveImage },
    { name: "Coconut Oil", icon: <Wheat className="w-6 h-6" />, color: "from-amber-50 to-amber-100", textColor: "text-amber-700", image: coconutImage },
    { name: "Groundnut Oil", icon: <Flame className="w-6 h-6" />, color: "from-yellow-50 to-yellow-100", textColor: "text-yellow-700", image: groundnutImage },
    { name: "Sesame Oil", icon: <Droplet className="w-6 h-6" />, color: "from-stone-50 to-stone-100", textColor: "text-stone-700", image: sesameImage },
    { name: "Sunflower Oil", icon: <Flame className="w-6 h-6" />, color: "from-yellow-50 to-amber-100", textColor: "text-amber-700", image: sunflowerImage },
    { name: "Walnut Oil", icon: <Droplet className="w-6 h-6" />, color: "from-amber-50 to-orange-100", textColor: "text-orange-700", image: walnutImage },
    { name: "Almond Oil", icon: <Droplet className="w-6 h-6" />, color: "from-amber-50 to-orange-100", textColor: "text-orange-700", image: almondImage },
    { name: "Castor Oil", icon: <Droplet className="w-6 h-6" />, color: "from-amber-50 to-orange-100", textColor: "text-orange-700", image: castorImage }
  ];

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm">
          Shop by
        </span>
        <h2 className="text-4xl font-bold text-amber-900 mt-2">
          Premium Oil Collection
        </h2>
        <div className="w-24 h-1 bg-linear-to-r from-amber-400 to-orange-400 mx-auto mt-4 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="group cursor-pointer relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition"
          >
            <div className="relative h-48">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div
                className={`absolute inset-0 bg-linear-to-br ${cat.color} opacity-90`}
              ></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`w-16 h-16 bg-white backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-md`}>
                  {React.cloneElement(cat.icon, {
                    className: `w-8 h-8 ${cat.textColor}`,
                  })}
                </div>
                <h3 className={`font-bold text-xl mb-1 ${cat.textColor}`}>{cat.name}</h3>
                <p className={`text-sm ${cat.textColor} font-medium`}>Shop now →</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
