export const API_ROUTES = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  patients: {
    list: '/api/patients',
    detail: (id) => `/api/patients/${id}`,
    create: '/api/patients',
    update: (id) => `/api/patients/${id}`,
  },
  ai: {
    chat: '/api/ai/chat',
    suggestions: '/api/ai/suggestions',
  },
  user: {
    profile: '/api/user/profile',
    settings: '/api/user/settings',
  },
};
