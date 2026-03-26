const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ChatService {
  getToken() {
    return localStorage.getItem('token');
  }

  async ask(message) {
    try {
      const token = this.getToken();
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/chat/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new ChatService();