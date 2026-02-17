import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

// Sample categories
const categories = [
  {
    name: 'Cooking Oils',
    description: 'Premium quality cooking oils for everyday use',
    icon: 'Droplet',
    bgColor: 'from-amber-400 to-orange-500',
    textColor: 'text-white',
    order: 1
  },
  {
    name: 'Health Oils',
    description: 'Nutritious oils for a healthy lifestyle',
    icon: 'Heart',
    bgColor: 'from-green-400 to-emerald-600',
    textColor: 'text-white',
    order: 2
  },
  {
    name: 'Essential Oils',
    description: 'Pure essential oils for aromatherapy',
    icon: 'Sparkles',
    bgColor: 'from-purple-400 to-pink-600',
    textColor: 'text-white',
    order: 3
  },
  {
    name: 'Specialty Oils',
    description: 'Gourmet and specialty oils for connoisseurs',
    icon: 'Star',
    bgColor: 'from-yellow-400 to-amber-600',
    textColor: 'text-white',
    order: 4
  }
];

// Sample products
const products = [
  {
    name: 'Extra Virgin Olive Oil',
    description: 'Premium cold-pressed olive oil from Mediterranean olives. Perfect for salads and light cooking.',
    price: 1274,
    oldPrice: 1400,
    brand: 'Golden Drops',
    size: '1',
    unit: 'L',
    images: ['/uploads/products/olive.jpg'],
    inStock: true,
    stockQuantity: 50,
    rating: 4.8,
    reviews: 124,
    badge: 'Bestseller',
    featured: true
  },
  {
    name: 'Cold Pressed Coconut Oil',
    description: 'Pure coconut oil extracted using traditional cold-press method. Rich in MCTs and natural goodness.',
    price: 1274,
    oldPrice: 1400,
    brand: 'Golden Drops',
    size: '1',
    unit: 'L',
    images: ['/uploads/products/coconut.jpg'],
    inStock: true,
    stockQuantity: 45,
    rating: 4.7,
    reviews: 98,
    badge: 'Organic',
    featured: true
  },
  {
    name: 'Wood Pressed Groundnut Oil',
    description: 'Traditional wood-pressed groundnut oil. Retains natural aroma and nutrients.',
    price: 1274,
    oldPrice: 1400,
    brand: 'Golden Drops',
    size: '1',
    unit: 'L',
    images: ['/uploads/products/groundnut.jpg'],
    inStock: true,
    stockQuantity: 40,
    rating: 4.6,
    reviews: 87,
    badge: 'Traditional',
    featured: true
  },
  {
    name: 'Pure Sesame Oil',
    description: 'Cold-pressed sesame oil with rich nutty flavor. Ideal for tempering and cooking.',
    price: 1274,
    oldPrice: 1400,
    brand: 'Golden Drops',
    size: '1',
    unit: 'L',
    images: ['/uploads/products/sesame.jpg'],
    inStock: true,
    stockQuantity: 35,
    rating: 4.8,
    reviews: 76,
    badge: 'Gingelly',
    featured: true
  },
  {
    name: 'Refined Sunflower Oil',
    description: 'Light and versatile sunflower oil. Perfect for all types of cooking.',
    price: 1274,
    oldPrice: 1400,
    brand: 'Golden Drops',
    size: '1',
    unit: 'L',
    images: ['/uploads/products/sunflower.jpg'],
    inStock: true,
    stockQuantity: 60,
    rating: 4.5,
    reviews: 112,
    badge: 'Light',
    featured: true
  },
  {
    name: 'Premium Walnut Oil',
    description: 'Gourmet walnut oil with rich, nutty flavor. Excellent for salads and finishing dishes.',
    price: 2274,
    oldPrice: 2675,
    brand: 'Golden Drops Premium',
    size: '500',
    unit: 'ml',
    images: ['/uploads/products/walnut.jpg'],
    inStock: true,
    stockQuantity: 20,
    rating: 4.9,
    reviews: 45,
    badge: 'Gourmet',
    featured: true
  },
  {
    name: 'Sweet Almond Oil',
    description: 'Pure sweet almond oil rich in Vitamin E. Great for cooking and skin care.',
    price: 2275,
    oldPrice: 2675,
    brand: 'Golden Drops Premium',
    size: '500',
    unit: 'ml',
    images: ['/uploads/products/almond.jpg'],
    inStock: true,
    stockQuantity: 25,
    rating: 4.7,
    reviews: 63,
    badge: 'Vitamin E',
    featured: true
  },
  {
    name: 'Traditional Castor Oil',
    description: 'Wood-pressed castor oil. Known for its health and wellness benefits.',
    price: 1275,
    oldPrice: 1675,
    brand: 'Golden Drops',
    size: '500',
    unit: 'ml',
    images: ['/uploads/products/castor.jpg'],
    inStock: true,
    stockQuantity: 30,
    rating: 4.6,
    reviews: 93,
    badge: 'Wood Pressed',
    featured: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Assign category to products (using first category for all products as an example)
    const productsWithCategory = products.map(product => ({
      ...product,
      category: insertedCategories[0]._id // Assign to "Cooking Oils" category
    }));

    // Insert products
    const insertedProducts = await Product.insertMany(productsWithCategory);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - Products: ${insertedProducts.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
