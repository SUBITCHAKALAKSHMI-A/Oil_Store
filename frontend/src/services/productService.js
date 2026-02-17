const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ProductService {
  // Get all products
  async getAllProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.featured) queryParams.append('featured', filters.featured);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const url = `${API_URL}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get single product
  async getProduct(productId) {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Search products
  async searchProducts(query) {
    try {
      const response = await fetch(`${API_URL}/products/search/query?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get featured products
  async getFeaturedProducts() {
    return this.getAllProducts({ featured: 'true' });
  }

  // Get products by category
  async getProductsByCategory(categoryId) {
    return this.getAllProducts({ category: categoryId });
  }
}

export default new ProductService();
