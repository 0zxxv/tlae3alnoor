// API Service for Tlae3 Alnoor App
// For Android emulator: use 10.0.2.2
// For iOS simulator: use localhost
// For physical device: use your computer's IP address
const API_BASE_URL = 'http://172.20.10.11:3000/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
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

// Export configuration setter
export const setApiBaseUrl = (url: string) => {
  // This would need to be implemented differently for actual runtime config
  console.log('API Base URL:', url);
};

