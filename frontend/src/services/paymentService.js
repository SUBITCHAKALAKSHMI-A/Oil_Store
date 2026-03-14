const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class PaymentService {
  getAuthToken() {
    return localStorage.getItem('token');
  }

  async createOrder(amount) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async verifyPayment(payload) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

const paymentService = new PaymentService();

export default paymentService;
