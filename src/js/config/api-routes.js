export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  patients: {
    list: '/patients',
    detail: (id) => `/patients/${id}`,
    create: '/patients',
    update: (id) => `/patients/${id}`,
  },
  ai: {
    chat: '/ai/chat',
    suggestions: '/ai/suggestions',
  },
  user: {
    profile: '/user/profile',
    settings: '/user/settings',
  },
};
