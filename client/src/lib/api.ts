// Legacy API client functions for authentication
const API_BASE = "/api";

export const apiClient = {
  async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE}/auth/user`);
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  },

  logout() {
    // Simple logout - just clear local storage
    localStorage.removeItem('user');
  }
};