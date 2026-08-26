import { showSuccess, showError } from './swal.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom error class for API response errors
 */
export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Standard fetch helper wrapper
 */
export async function request(endpoint, options = {}) {
  const {
    showToastOnError = true,
    showToastOnSuccess = options.method && options.method !== 'GET',
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...fetchOptions,
    headers,
  };

  if (fetchOptions.body && typeof fetchOptions.body === 'object') {
    config.body = JSON.stringify(fetchOptions.body);
  }

  try {
    const response = await fetch(url, config);
    let responseData = null;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage = responseData?.message || responseData?.error || 'Something went wrong';
      if (showToastOnError) {
        showError(errorMessage);
      }
      throw new ApiError(response.status, errorMessage, responseData);
    }

    if (showToastOnSuccess) {
      showSuccess(responseData?.message || 'Operation successful');
    }

    return responseData && responseData.success && responseData.data !== undefined
      ? responseData.data
      : responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const networkErrorMessage = error.message || 'Network connection failed';
    if (showToastOnError) {
      showError(networkErrorMessage);
    }
    throw new Error(networkErrorMessage);
  }
}

export const api = {
  auth: {
    register: (name, email, password) =>
      request('/auth/register', { method: 'POST', body: { name, email, password } }),
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: { email, password } }),
  },
  users: {
    getMe: () => request('/users/me'),
    updateMe: (data) => request('/users/me', { method: 'PUT', body: data }),
    deleteMe: () => request('/users/me', { method: 'DELETE' }),
    changePassword: (currentPassword, newPassword) =>
      request('/users/change-password', { method: 'PUT', body: { currentPassword, newPassword } }),
  },
  posts: {
    list: (page = 1, limit = 6) => request(`/posts?page=${page}&limit=${limit}`),
    get: (id) => request(`/posts/${id}`),
    create: (title, content) => request('/posts', { method: 'POST', body: { title, content } }),
    update: (id, title, content) => request(`/posts/${id}`, { method: 'PUT', body: { title, content } }),
    delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  }
};
