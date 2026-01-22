

// API Base URL - Using Vite proxy
const API_BASE_URL = '/api';

// Login API Call
export const login = async (credentials) => {
  try {
    console.log('Sending login request with:', credentials);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error response:', errorData);
      return { success: false, message: `Error: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    console.log('Login response:', data);
    console.log('Response data type:', typeof data);
    console.log('Response keys:', Object.keys(data));
    
    // Check if token exists in response (backend might return it directly or in data object)
    const token = data.token || data.data?.token || data.access_token;
    
    if (!token) {
      console.error('No token found in response');
      return { success: false, message: 'Login failed: No token received' };
    }

    // Store token in localStorage
    localStorage.setItem('authToken', token);
    console.log('Token stored successfully');

    return { success: true, token, data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: `Network error: ${error.message}` };
  }
};

// Get Authenticated User Data (Me endpoint)
export const getMe = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, message: 'No authentication token found' };
    }

    console.log('Token found:', token.substring(0, 20) + '...');
    console.log('Fetching user data from /auth/me');
    
    // Try with Bearer prefix first (most common)
    let response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Me endpoint response status:', response.status);

    // If Bearer format fails with 500, try without Bearer
    if (response.status === 500) {
      console.log('Bearer failed with 500, trying without Bearer prefix...');
      response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
      });
      console.log('Retry response status:', response.status);
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        return { success: false, message: 'Unauthorized. Please login again.' };
      }
      const errorData = await response.text();
      console.error('Error response body:', errorData);
      console.error('Error response status:', response.status);
      return { success: false, message: `Failed to fetch user data: ${response.status}` };
    }

    const data = await response.json();
    console.log('User data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Me endpoint error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Get Profile API Call (Alternative)
export const getProfile = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        return { success: false, message: 'Unauthorized. Please login again.' };
      }
      return { success: false, message: 'Failed to fetch profile' };
    }

    const data = await response.json();
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('Profile fetch error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Logout API Call
export const logout = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Clear token regardless of response
    localStorage.removeItem('authToken');

    return { success: response.ok };
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('authToken');
    return { success: false, message: 'Logout failed' };
  }
};

// Generic API Call Helper
export const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
      }
      return { success: false, status: response.status };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API call error:', error);
    return { success: false, message: 'Network error' };
  }
};

// Register Organization API Call
export const registerOrganization = async (formData) => {
    try {
    console.log('Sending organization registration request with:', formData);
    
    // Clean the data - remove optional fields if empty
    const cleanedData = { ...formData };
    
    // Rule 1: Organization Name - Trim spaces
    if (cleanedData.name) {
      cleanedData.name = cleanedData.name.trim();
    }

    // Rule 2: Registration Number - Stored in UPPERCASE
    if (cleanedData.registrationNo) {
      cleanedData.registrationNo = cleanedData.registrationNo.trim().toUpperCase();
    }

    // Remove optional fields if they are empty strings
    if (!cleanedData.subtypeClassId) {
      delete cleanedData.subtypeClassId;
    }
    if (!cleanedData.websiteUrl) {
      delete cleanedData.websiteUrl;
    }
    if (!cleanedData.address) {
      delete cleanedData.address;
    }

    console.log('Cleaned data being sent:', cleanedData);
    
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/organizations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(cleanedData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      return { success: false, message: errorData.message || `Error: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    console.log('Organization registration response:', data);
    console.log('Response data type:', typeof data);
    console.log('Response keys:', Object.keys(data));
    
    return { success: true, data };
  } catch (error) {
    console.error('Organization registration error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

// Get Packages
export const getPackages = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/packages`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return { success: false, message: `Error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching packages:', error);
    return { success: false, message: 'Failed to fetch packages' };
  }
};

// Register Organization Admin
export const registerOrgAdmin = async (organizationId, adminData) => {
  debugger;
    try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/organizations/${organizationId}/org-admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(adminData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error registering admin:', error);
    return { success: false, message: 'Failed to register admin' };
  }
};

// Get Organizations List
export const getOrganizations = async (params) => {
  try {
    console.log('Fetching organizations list with params:', params);
    
    const token = localStorage.getItem('authToken');
    const headers = {
      'Accept': 'application/json',
    };

    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const queryParams = new URLSearchParams();
    if (params) {
      if (params.search) queryParams.append('search', params.search);
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.sort) queryParams.append('sort', params.sort);
    }
    const queryString = queryParams.toString();

    const response = await fetch(`${API_BASE_URL}/admin/organizations${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers,
    });

    console.log('Get organizations response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error fetching organizations:', errorData);
      return { success: false, data: [], message: `Error: ${response.status}` };
    }

    const data = await response.json();
    console.log('Organizations fetched:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return { success: false, data: [], message: 'Failed to fetch organizations' };
  }
};

// Get Organization Categories
export const getCategories = async () => {
    
  try {
    console.log('Fetching organization categories...');
    
    const token = localStorage.getItem('authToken');
    const headers = {
      'Accept': 'application/json',
    };

    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/master/entity/categories`, {
      method: 'GET',
      headers,
    });

    console.log('Categories response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error fetching categories:', errorData);
      return { success: false, data: [], message: `Error: ${response.status}` };
    }

    const data = await response.json();
    console.log('Categories fetched:', data);
    
    return { success: true, data: Array.isArray(data) ? data : data.data || [] };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, data: [], message: 'Failed to fetch categories' };
  }
};

// Get Organization Subtypes
export const getSubtypes = async (categoryId) => {
  try {
    console.log('Fetching subtypes for categoryId:', categoryId);
    
    const token = localStorage.getItem('authToken');
    const headers = {
      'Accept': 'application/json',
    };

    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/master/entity/subtypes?categoryId=${categoryId}`, {
      method: 'GET',
      headers,
    });

    console.log('Subtypes response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error fetching subtypes:', errorData);
      return { success: false, data: [], message: `Error: ${response.status}` };
    }

    const data = await response.json();
    console.log('Subtypes fetched:', data);
    
    return { success: true, data: Array.isArray(data) ? data : data.data || [] };
  } catch (error) {
    console.error('Error fetching subtypes:', error);
    return { success: false, data: [], message: 'Failed to fetch subtypes' };
  }
};

// Get Organization Subtype Classes
export const getSubtypeClasses = async (subtypeId) => {
  try {
    console.log('Fetching subtype classes for subtypeId:', subtypeId);
    
    const token = localStorage.getItem('authToken');
    const headers = {
      'Accept': 'application/json',
    };

    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/master/entity/subtype-classes?subtypeId=${subtypeId}`, {
      method: 'GET',
      headers,
    });

    console.log('Subtype classes response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error fetching subtype classes:', errorData);
      return { success: false, data: [], message: `Error: ${response.status}` };
    }

    const data = await response.json();
    console.log('Subtype classes fetched:', data);
    
    return { success: true, data: Array.isArray(data) ? data : data.data || [] };
  } catch (error) {
    console.error('Error fetching subtype classes:', error);
    return { success: false, data: [], message: 'Failed to fetch subtype classes' };
  }
};

// Forgot Password API Call
export const forgotPassword = async (email) => {
  try {
    console.log('Sending forgot password request for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        clientUrl: `${window.location.origin}/resetpassword`
      }),
    });

    console.log('Forgot password response status:', response.status);

    // Parse response body safely: prefer JSON, fall back to text
    const parseBody = async (resp) => {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return resp.json().catch(() => ({}));
      }
      return resp.text();
    };
    
    if (!response.ok) {
      const errorData = await parseBody(response);
      console.error('Error response:', errorData);
      const message = typeof errorData === 'string' && errorData.trim()
        ? errorData
        : errorData.message || `Error: ${response.status}`;
      return { success: false, message };
    }

    const data = await parseBody(response);
    console.log('Forgot password response:', data);
    const successMessage = typeof data === 'string' && data.trim()
      ? data
      : 'Check your email for reset instructions';
    
    return { success: true, data, message: successMessage };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

// Reset Password API Call
export const resetPassword = async (token, newPassword, confirmPassword) => {
  try {
    console.log('Sending reset password request');
    
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });

    console.log('Reset password response status:', response.status);

    // Parse response body safely: prefer JSON, fall back to text
    const parseBody = async (resp) => {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return resp.json().catch(() => ({}));
      }
      return resp.text();
    };
    
    if (!response.ok) {
      const errorData = await parseBody(response);
      console.error('Error response:', errorData);
      const message = typeof errorData === 'string' && errorData.trim()
        ? errorData
        : errorData.message || `Error: ${response.status}`;
      return { success: false, message };
    }

    const data = await parseBody(response);
    console.log('Reset password response:', data);
    const successMessage = typeof data === 'string' && data.trim()
      ? data
      : 'Password reset successfully';
    
    return { success: true, data, message: successMessage };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

// Set Password API Call
export const setPassword = async (token, newPassword, confirmPassword) => {
  try {
    console.log('Sending set password request');
    
    const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });

    console.log('Set password response status:', response.status);

    // Parse response body safely: prefer JSON, fall back to text
    const parseBody = async (resp) => {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return resp.json().catch(() => ({}));
      }
      return resp.text();
    };
    
    if (!response.ok) {
      const errorData = await parseBody(response);
      console.error('Error response:', errorData);
      const message = typeof errorData === 'string' && errorData.trim()
        ? errorData
        : errorData.message || `Error: ${response.status}`;
      return { success: false, message };
    }

    const data = await parseBody(response);
    console.log('Set password response:', data);
    const successMessage = typeof data === 'string' && data.trim()
      ? data
      : 'Password set successfully';
    
    return { success: true, data, message: successMessage };
  } catch (error) {
    console.error('Set password error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

// Change Password API Call
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    console.log('Sending change password request');
    
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    console.log('Change password response status:', response.status);

    // Parse response body safely: prefer JSON, fall back to text
    const parseBody = async (resp) => {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return resp.json().catch(() => ({}));
      }
      return resp.text();
    };

    if (!response.ok) {
      const errorData = await parseBody(response);
      console.error('Error response:', errorData);
      const message = typeof errorData === 'string' && errorData.trim()
        ? errorData
        : errorData.message || `Error: ${response.status}`;
      return { success: false, message };
    }

    const data = await parseBody(response);
    console.log('Change password response:', data);
    const successMessage = typeof data === 'string' && data.trim()
      ? data
      : 'Password changed successfully';

    return { success: true, data, message: successMessage };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

// Update User Profile
export const updateMe = async (userData) => {
    debugger;
  try {
    console.log('Updating user profile with:', userData);
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(userData),
    });

    console.log('Update profile response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error updating profile:', errorData);
      return { success: false, message: errorData.message || `Error: ${response.status}` };
    }

    const data = await response.json();
    console.log('Profile updated:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

// Subscribe Package to Organization
export const subscribePackage = async (organizationId, packageId) => {
  try {
    console.log(`Subscribing organization ${organizationId} to package ${packageId}`);
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/organizations/${organizationId}/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ packageId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.message || `Error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error subscribing package:', error);
    return { success: false, message: 'Failed to subscribe package' };
  }
};
  