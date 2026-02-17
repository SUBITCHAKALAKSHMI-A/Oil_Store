import React from "react";
import { Truck, Shield, Award, Leaf } from "lucide-react";

const Features = () => {
  const features = [
    { icon: <Truck className="w-6 h-6" />, title: "Free Shipping", desc: "On orders over $50" },
    { icon: <Shield className="w-6 h-6" />, title: "100% Pure", desc: "Authentic quality" },
    { icon: <Award className="w-6 h-6" />, title: "Premium Grade", desc: "Cold pressed" },
    { icon: <Leaf className="w-6 h-6" />, title: "Eco Friendly", desc: "Sustainable" },
  ];

  return (
    <section className="container mx-auto px-6 -mt-10 relative z-20">
      <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 border border-amber-100">
        {features.map((f, i) => (
          <div key={i} className="flex items-center space-x-4 group">
            <div className="w-14 h-14 bg-linear-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-amber-700 group-hover:scale-110 transition">
              {f.icon}
            </div>
            <div>
              <h4 className="font-bold text-amber-900">{f.title}</h4>
              <p className="text-sm text-amber-600">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;

