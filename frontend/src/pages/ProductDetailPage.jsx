import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Truck,
  RefreshCcw,
  ShieldCheck,
  ArrowLeft,
  Package,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import productService from "../services/productService";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copyMsg, setCopyMsg] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProduct(productId);
      if (response.success && response.product) {
        setProduct(response.product);
      } else {
        setError("Product not found.");
      }
    } catch (err) {
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/600x600?text=No+Image";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate("/cart");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyMsg(true);
      setTimeout(() => setCopyMsg(false), 2000);
    });
  };

  const renderStars = (rating = 0) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.round(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300 fill-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-amber-700 font-medium">Loading product...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
          <div className="text-center">
            <Package className="w-20 h-20 text-amber-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-900 mb-2">
              {error || "Product not found"}
            </h2>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 transition"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [null];

  const categoryName =
    product.category?.name || product.brand || "";

  const discount =
    product.oldPrice && product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-b from-amber-50/30 to-orange-50/30 py-8">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-8 flex-wrap gap-1">
            <Link to="/" className="hover:text-amber-600 transition">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => navigate("/")}
              className="hover:text-amber-600 transition"
            >
              Shop
            </button>
            {categoryName && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-500">{categoryName}</span>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-amber-700 font-medium truncate max-w-45">
              {product.name}
            </span>
          </nav>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-amber-700 hover:text-amber-900 font-medium mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

              {/* ── LEFT: Image Gallery ── */}
              <div className="p-6 md:p-10 bg-gray-50 flex flex-col items-center">
                {/* Main image */}
                <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-lg bg-white mb-5">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate("/login");
                        return;
                      }
                      toggleWishlist(product);
                    }}
                    className="absolute top-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:bg-white"
                    aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-300 ${
                        isInWishlist(product._id)
                          ? "text-pink-500 fill-pink-500"
                          : "text-slate-500"
                      }`}
                    />
                  </button>
                  <img
                    src={getImageUrl(images[selectedImage])}
                    alt={product.name}
                    className="w-full h-80 md:h-105 object-cover transition duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/600x600?text=No+Image";
                    }}
                  />
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-3 flex-wrap justify-center">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                          selectedImage === idx
                            ? "border-amber-500 shadow-md scale-105"
                            : "border-transparent hover:border-amber-300"
                        }`}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`thumb-${idx}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/80x80?text=img";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── RIGHT: Product Info ── */}
              <div className="p-6 md:p-10 flex flex-col justify-between">
                <div>
                  {/* Stock badge */}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                      product.inStock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
                  </span>

                  {/* Category / Brand label */}
                  {categoryName && (
                    <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
                      {categoryName}
                    </p>
                  )}

                  {/* Product name */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  {(product.rating > 0 || product.reviews > 0) && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">{renderStars(product.rating)}</div>
                      <span className="text-sm text-gray-500">
                        ({product.reviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </span>
                    {product.oldPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        ₹{product.oldPrice?.toLocaleString("en-IN")}
                      </span>
                    )}
                    {discount && (
                      <span className="bg-green-100 text-green-700 text-sm font-semibold px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <hr className="border-gray-100 mb-5" />

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {product.description}
                    </p>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                    {product.brand && (
                      <div>
                        <span className="text-gray-500">Brand: </span>
                        <span className="font-semibold text-gray-800">
                          {product.brand}
                        </span>
                      </div>
                    )}
                    {product.size && (
                      <div>
                        <span className="text-gray-500">Size: </span>
                        <span className="font-semibold text-gray-800">
                          {product.size} {product.unit}
                        </span>
                      </div>
                    )}
                    {product.badge && (
                      <div>
                        <span className="text-gray-500">Type: </span>
                        <span className="font-semibold text-gray-800">
                          {product.badge}
                        </span>
                      </div>
                    )}
                    {product.stockQuantity > 0 && (
                      <div>
                        <span className="text-gray-500">Available: </span>
                        <span className="font-semibold text-gray-800">
                          {product.stockQuantity} units
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Quantity
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-amber-500 hover:text-amber-600 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-lg font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity((q) =>
                            product.stockQuantity
                              ? Math.min(product.stockQuantity, q + 1)
                              : q + 1
                          )
                        }
                        className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-amber-500 hover:text-amber-600 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-6">
                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className={`flex-1 min-w-35 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 font-semibold transition ${
                        product.inStock
                          ? addedToCart
                            ? "border-green-500 text-green-600 bg-green-50"
                            : "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                          : "border-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {addedToCart ? "Added!" : "Add to Cart"}
                    </button>

                    {/* Buy Now */}
                    <button
                      onClick={handleBuyNow}
                      disabled={!product.inStock}
                      className={`flex-1 min-w-35 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition shadow-lg ${
                        product.inStock
                          ? "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </button>

                    {/* Share */}
                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-amber-300 transition"
                      >
                        <Share2 className="w-5 h-5 text-gray-400" />
                      </button>
                      {copyMsg && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Link copied!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mb-2">
                        <Truck className="w-5 h-5 text-pink-400" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        Free Shipping
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mb-2">
                        <RefreshCcw className="w-5 h-5 text-pink-400" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        Easy Returns
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mb-2">
                        <ShieldCheck className="w-5 h-5 text-pink-400" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        Secure Payment
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
