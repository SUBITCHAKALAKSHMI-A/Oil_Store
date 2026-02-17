const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AdminService {
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Dashboard stats
  async getDashboardStats() {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // User Management
  async getAllUsers() {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async toggleUserStatus(userId, isActive) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Product Management
  async getAllProducts() {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async createProduct(productData) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async updateProduct(productId, productData) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async deleteProduct(productId) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async uploadProductImages(images) {
    try {
      const token = this.getAuthToken();
      const formData = new FormData();
      
      // Append all image files
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }

      const response = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Category Management
  async getAllCategories() {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async createCategory(categoryData) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async deleteCategory(categoryId) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Order Management
  async getAllOrders() {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/admin/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new AdminService();
