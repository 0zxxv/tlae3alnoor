// API Service for Tlae3 Alnoor App
// For Android emulator: use 10.0.2.2
// For iOS simulator: use localhost
// For physical device: use your computer's IP address
const API_BASE_URL = 'http://192.168.100.12:3001/api';
export const SERVER_BASE_URL = 'http://192.168.100.12:3001';

// Helper function for API calls with timeout
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[API] ${method} ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Network error - server not reachable
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        console.error(`[API Network Error] Cannot reach server at ${url}`);
        throw new Error(`Cannot connect to server. Make sure:\n1. Backend is running (npm start in backend folder)\n2. IP address is correct: ${API_BASE_URL}\n3. Phone and computer are on same Wi-Fi`);
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error(`[API Error] ${method} ${endpoint}:`, errorData);
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[API Success] ${method} ${endpoint}`);
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[API Timeout] ${method} ${endpoint} - Request took too long`);
      throw new Error('Request timeout - Server is not responding. Check if backend is running.');
    }
    // Re-throw if it's already our formatted error
    if (error.message && error.message.includes('Cannot connect')) {
      throw error;
    }
    console.error(`[API Error] ${method} ${endpoint}:`, error.message || error);
    throw new Error(error.message || 'Network error occurred');
  }
}

// Auth API
export const authApi = {
  login: (userType: string, identifier: string, password: string) =>
    apiCall<{ user: any; userType: string }>('/auth/login', 'POST', { userType, identifier, password }),
  
  demoLogin: (userType: string) =>
    apiCall<{ user: any; userType: string }>('/auth/demo-login', 'POST', { userType }),
};

// Students API
export const studentsApi = {
  getAll: () => apiCall<any[]>('/students'),
  getById: (id: string) => apiCall<any>(`/students/${id}`),
  getByParent: (parentId: string) => apiCall<any[]>(`/students/parent/${parentId}`),
  create: (data: any) => apiCall<any>('/students', 'POST', data),
  update: (id: string, data: any) => apiCall<any>(`/students/${id}`, 'PUT', data),
  delete: (id: string) => apiCall<any>(`/students/${id}`, 'DELETE'),
};


// Parents API
export const parentsApi = {
  getAll: () => apiCall<any[]>('/parents'),
  getById: (id: string) => apiCall<any>(`/parents/${id}`),
  create: (data: any) => apiCall<any>('/parents', 'POST', data),
  update: (id: string, data: any) => apiCall<any>(`/parents/${id}`, 'PUT', data),
  delete: (id: string) => apiCall<any>(`/parents/${id}`, 'DELETE'),
};

// Teachers API
export const teachersApi = {
  getAll: () => apiCall<any[]>('/teachers'),
  getById: (id: string) => apiCall<any>(`/teachers/${id}`),
  create: (data: any) => apiCall<any>('/teachers', 'POST', data),
  update: (id: string, data: any) => apiCall<any>(`/teachers/${id}`, 'PUT', data),
  delete: (id: string) => apiCall<any>(`/teachers/${id}`, 'DELETE'),
};

// Slideshow API
export const slideshowApi = {
  getAll: (showAll = false) => apiCall<any[]>(`/slideshow${showAll ? '?all=true' : ''}`),
  getById: (id: string) => apiCall<any>(`/slideshow/${id}`),
  create: (data: any) => apiCall<any>('/slideshow', 'POST', data),
  update: (id: string, data: any) => apiCall<any>(`/slideshow/${id}`, 'PUT', data),
  delete: (id: string) => apiCall<any>(`/slideshow/${id}`, 'DELETE'),
  reorder: (order: { id: string; display_order: number }[]) =>
    apiCall<any[]>('/slideshow/reorder', 'POST', { order }),
};

// Events API
export const eventsApi = {
  getAll: (type?: string) => apiCall<any[]>(`/events${type ? `?type=${type}` : ''}`),
  getById: (id: string) => apiCall<any>(`/events/${id}`),
  create: (data: any) => apiCall<any>('/events', 'POST', data),
  update: (id: string, data: any) => apiCall<any>(`/events/${id}`, 'PUT', data),
  delete: (id: string) => apiCall<any>(`/events/${id}`, 'DELETE'),
};

// Announcements API
export const announcementsApi = {
  getAll: () => apiCall<any[]>('/announcements'),
  getById: (id: string) => apiCall<any>(`/announcements/${id}`),
  create: (data: any) => apiCall<any>('/announcements', 'POST', data),
  update: (id: string, data: any) => apiCall<any>(`/announcements/${id}`, 'PUT', data),
  delete: (id: string) => apiCall<any>(`/announcements/${id}`, 'DELETE'),
};

// Grades API
export const gradesApi = {
  getAll: (studentId?: string) => apiCall<any[]>(`/grades${studentId ? `?student_id=${studentId}` : ''}`),
  getByStudent: (studentId: string) => apiCall<any[]>(`/grades/student/${studentId}`),
  create: (data: any) => apiCall<any>('/grades', 'POST', data),
  update: (id: string, data: any) => apiCall<any>(`/grades/${id}`, 'PUT', data),
  delete: (id: string) => apiCall<any>(`/grades/${id}`, 'DELETE'),
};

// Evaluations API
export const evaluationsApi = {
  // Forms
  getForms: () => apiCall<any[]>('/evaluations/forms'),
  getFormById: (id: string) => apiCall<any>(`/evaluations/forms/${id}`),
  createForm: (data: any) => apiCall<any>('/evaluations/forms', 'POST', data),
  updateForm: (id: string, data: any) => apiCall<any>(`/evaluations/forms/${id}`, 'PUT', data),
  deleteForm: (id: string) => apiCall<any>(`/evaluations/forms/${id}`, 'DELETE'),
  addQuestion: (formId: string, data: any) => apiCall<any>(`/evaluations/forms/${formId}/questions`, 'POST', data),
  deleteQuestion: (id: string) => apiCall<any>(`/evaluations/questions/${id}`, 'DELETE'),
  
  // Student Evaluations
  getByStudent: (studentId: string) => apiCall<any[]>(`/evaluations/student/${studentId}`),
  getById: (id: string) => apiCall<any>(`/evaluations/${id}`),
  create: (data: any) => apiCall<any>('/evaluations', 'POST', data),
  delete: (id: string) => apiCall<any>(`/evaluations/${id}`, 'DELETE'),
};

// Upload image to server
export const uploadImage = async (base64Image: string): Promise<string> => {
  if (!base64Image) {
    throw new Error('No image data provided');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.url) {
      console.error('Invalid response data:', data);
      throw new Error('Invalid response from server');
    }

    return `${SERVER_BASE_URL}${data.url}`;
  } catch (error: any) {
    console.error('Upload image error:', error);
    throw error;
  }
};

// Health check function to test backend connection
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Export configuration setter
export const setApiBaseUrl = (url: string) => {
  // This would need to be implemented differently for actual runtime config
  console.log('API Base URL:', url);
};

