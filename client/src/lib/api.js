// API Configuration for Python Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// API client with authentication
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/';
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Properties
  async getProperties() {
    return this.request('/properties');
  }

  async getProperty(id) {
    return this.request(`/properties/${id}`);
  }

  // Audits
  async getAudits(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/audits?${searchParams}`);
  }

  async getAudit(id) {
    return this.request(`/audits/${id}`);
  }

  async createAudit(auditData) {
    return this.request('/audits', {
      method: 'POST',
      body: JSON.stringify(auditData),
    });
  }

  async updateAudit(id, updateData) {
    return this.request(`/audits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async getAuditItems(auditId) {
    return this.request(`/audits/${auditId}/items`);
  }

  async createAuditItem(auditId, itemData) {
    return this.request(`/audits/${auditId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateAuditItem(itemId, updateData) {
    return this.request(`/audits/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // AI Features
  async analyzePhoto(imageData, context) {
    return this.request('/ai/analyze-photo', {
      method: 'POST',
      body: JSON.stringify({ image_data: imageData, context }),
    });
  }

  async suggestScore(itemDescription, comments, photos = []) {
    return this.request('/ai/suggest-score', {
      method: 'POST',
      body: JSON.stringify({
        item_description: itemDescription,
        comments,
        photos,
      }),
    });
  }

  async generateReport(auditId, includeActionPlan = true) {
    return this.request(`/ai/generate-report/${auditId}`, {
      method: 'POST',
      body: JSON.stringify({ include_action_plan: includeActionPlan }),
    });
  }

  async getAuditInsights(auditId) {
    return this.request(`/ai/insights/${auditId}`);
  }

  async updateItemAI(itemId) {
    return this.request(`/ai/update-item-ai/${itemId}`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
