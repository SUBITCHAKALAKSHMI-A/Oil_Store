import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const productId = product._id || product.id;
      const existingItem = prevItems.find(item => item.id === productId);
      
      if (existingItem) {
        // If item exists, increase quantity
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Transform product to cart item format
        const cartItem = {
          id: productId,
          name: product.name,
          price: typeof product.price === 'number' ? `₹${product.price}` : product.price,
          oldPrice: product.oldPrice ? (typeof product.oldPrice === 'number' ? `₹${product.oldPrice}` : product.oldPrice) : null,
          image: product.images && product.images.length > 0 
            ? `http://localhost:5000${product.images[0]}` 
            : (product.image || 'https://via.placeholder.com/400x300?text=No+Image'),
          quantity: 1
        };
        return [...prevItems, cartItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('₹', '').replace(',', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Wishlist functions
  const addToWishlist = (product) => {
    setWishlistItems(prevItems => {
      const productId = product._id || product.id;
      const exists = prevItems.find(item => item.id === productId);
      if (exists) {
        return prevItems; // Already in wishlist
      }
      
      // Transform product to wishlist item format
      const wishlistItem = {
        id: productId,
        name: product.name,
        price: typeof product.price === 'number' ? `₹${product.price}` : product.price,
        oldPrice: product.oldPrice ? (typeof product.oldPrice === 'number' ? `₹${product.oldPrice}` : product.oldPrice) : null,
        image: product.images && product.images.length > 0 
          ? `http://localhost:5000${product.images[0]}` 
          : (product.image || 'https://via.placeholder.com/400x300?text=No+Image')
      };
      return [...prevItems, wishlistItem];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const toggleWishlist = (product) => {
    const productId = product._id || product.id;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    cartItems,
    wishlistItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    getWishlistCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

