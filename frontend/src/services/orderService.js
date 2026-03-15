const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class OrderService {
  getAuthToken() {
    return localStorage.getItem('token');
  }

  async getMyOrders() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/user/orders`, {
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

  async getOrderById(orderId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/user/orders/${orderId}`, {
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

  async cancelOrder(orderId, reason) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const response = await fetch(`${API_URL}/user/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new OrderService();
