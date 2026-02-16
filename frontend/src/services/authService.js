const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AuthService {
  // User Signup
  async userSignup(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role);
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // User Login
  async userLogin(credentials) {
    try {
      const response = await fetch(`${API_URL}/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', data.user.role);
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Admin Signup
  async adminSignup(adminData) {
    try {
      const response = await fetch(`${API_URL}/auth/admin/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.admin));
        localStorage.setItem('userRole', data.admin.role);
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Admin Login
  async adminLogin(credentials) {
    try {
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.admin));
        localStorage.setItem('userRole', data.admin.role);
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Get user role
  getUserRole() {
    return localStorage.getItem('userRole');
  }

  // Check if admin
  isAdmin() {
    const role = this.getUserRole();
    return role === 'admin' || role === 'superadmin';
  }

  // Check if user
  isUser() {
    return this.getUserRole() === 'user';
  }
}

export default new AuthService();
