import React from "react";
import { Droplet, MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin, ChevronRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-amber-200 pt-16 pb-8">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12">
          {/* Company Info - Pondicherry Special */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-3 mb-5">
              <div className="relative">
                <div className="w-14 h-14 bg-linear-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <Droplet className="w-8 h-8 text-white" fill="white" stroke="white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
                  PDY
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                  Golden<span className="text-amber-600">Drops</span>
                </h2>
                <p className="text-xs text-amber-600 font-medium tracking-wider">
                  EST. 1998 • PONDICHERRY
                </p>
              </div>
            </div>
            
            <p className="text-amber-700 mb-6 leading-relaxed">
              Since 1998, GoldenDrops has been Pondicherry's trusted source for premium cold-pressed oils. 
              Our traditional wood-pressed methods preserve the authentic flavor and nutritional value of every drop.
            </p>
            
            {/* Pondicherry Store Address */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wider">PONDICHERRY STORE</h4>
                  <p className="text-amber-700 text-sm mt-1">
                    42, Mission Street, White Town,<br />
                    Pondicherry - 605001, India
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-amber-700">
                <Phone className="w-4 h-4 text-amber-600" />
                <span className="text-sm hover:text-amber-900 transition">+91 413 222 5678</span>
              </div>
              <div className="flex items-center space-x-3 text-amber-700">
                <Mail className="w-4 h-4 text-amber-600" />
                <span className="text-sm hover:text-amber-900 transition">hello@goldendrops.in</span>
              </div>
              <div className="flex items-center space-x-3 text-amber-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm">Mon-Sat: 9:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links - Oil Categories */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-amber-900 mb-6 text-lg relative inline-block">
              Our Oils
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-amber-400 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                "Extra Virgin Olive", 
                "Cold Pressed Coconut", 
                "Wood Pressed Groundnut", 
                "Pure Gingelly Sesame", 
                "Refined Sunflower", 
                "Premium Walnut",
                "Sweet Almond",
                "Traditional Peanut"
              ].map((item, index) => (
                <li key={index} className="group">
                  <a href="#" className="text-amber-700 hover:text-amber-900 text-sm flex items-center transition">
                    <ChevronRight className="w-3 h-3 mr-2 text-amber-400 group-hover:translate-x-1 transition" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links - Shop */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-amber-900 mb-6 text-lg relative inline-block">
              Shop
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-amber-400 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                "Best Sellers", 
                "New Arrivals", 
                "Gift Packs", 
                "Bulk Orders", 
                "Corporate Gifting", 
                "Oil Subscriptions",
                "Special Offers",
                "Store Locator"
              ].map((item, index) => (
                <li key={index} className="group">
                  <a href="#" className="text-amber-700 hover:text-amber-900 text-sm flex items-center transition">
                    <ChevronRight className="w-3 h-3 mr-2 text-amber-400 group-hover:translate-x-1 transition" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-amber-900 mb-6 text-lg relative inline-block">
              Support
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-amber-400 rounded-full"></span>
            </h4>
            <ul className="space-y-3 mb-8">
              {[
                "About Us", 
                "Contact Us", 
                "FAQs", 
                "Shipping Policy", 
                "Returns & Refunds", 
                "Privacy Policy",
                "Terms of Service",
                "Wholesale Inquiry"
              ].map((item, index) => (
                <li key={index} className="group">
                  <a href="#" className="text-amber-700 hover:text-amber-900 text-sm flex items-center transition">
                    <ChevronRight className="w-3 h-3 mr-2 text-amber-400 group-hover:translate-x-1 transition" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Payment Methods */}
            <h4 className="font-bold text-amber-900 mb-4 text-sm uppercase tracking-wider">
              We Accept
            </h4>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-2 bg-amber-50 rounded-lg text-amber-800 text-xs font-medium border border-amber-200">
                Visa
              </div>
              <div className="px-3 py-2 bg-amber-50 rounded-lg text-amber-800 text-xs font-medium border border-amber-200">
                Mastercard
              </div>
              <div className="px-3 py-2 bg-amber-50 rounded-lg text-amber-800 text-xs font-medium border border-amber-200">
                UPI
              </div>
              <div className="px-3 py-2 bg-amber-50 rounded-lg text-amber-800 text-xs font-medium border border-amber-200">
                PayPal
              </div>
              <div className="px-3 py-2 bg-amber-50 rounded-lg text-amber-800 text-xs font-medium border border-amber-200">
                RuPay
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Social & Copyright */}
        <div className="border-t border-amber-200 pt-8 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Media - Professional */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-sm text-amber-700 font-medium">Connect with us:</span>
              <a href="#" className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            
            {/* Copyright & Address */}
            <div className="text-center md:text-right">
              <p className="text-sm text-amber-700">
                © 2025 <span className="font-semibold text-amber-800">GoldenDrops</span>. All rights reserved.
              </p>
              <p className="text-xs text-amber-500 mt-1">
                Made with ❤️ in Pondicherry • Traditional cold-pressed oils since 1998
              </p>
            </div>
          </div>
          
          {/* Bottom Decorative Line */}
          <div className="mt-6 pt-4 border-t border-amber-100 text-center">
            <p className="text-xs text-amber-400">
              Wood-pressed • Cold-pressed • Organic • Chemical-free • Traditional recipes
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;