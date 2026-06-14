// Endpoint riêng cho admin
export const ADMIN_ENDPOINTS = {
  auth: {
    login: '/admin/auth/login',
    me: '/admin/auth/me',
    logout: '/admin/auth/logout',
    permissions: '/admin/auth/permissions',
  },
  dashboard: {
    overview: '/admin/dashboard/overview',
    chart: '/admin/dashboard/chart',
  },
  users: {
    list: '/admin/users',
    detail: (id) => `/admin/users/${id}`,
    status: (id) => `/admin/users/${id}/status`,
    note: (id) => `/admin/users/${id}/note`,
    notes: (id) => `/admin/users/${id}/notes`,
    resetPassword: (id) => `/admin/users/${id}/reset-password`,
    revokeSessions: (id) => `/admin/users/${id}/revoke-sessions`,
    bulkAction: '/admin/users/bulk-action',
  },
  verifications: {
    list: '/admin/verifications',
    detail: (id) => `/admin/verifications/${id}`,
    approve: (id) => `/admin/verifications/${id}/approve`,
    reject: (id) => `/admin/verifications/${id}/reject`,
  },
  photos: {
    list: '/admin/photos',
    approve: (id) => `/admin/photos/${id}/approve`,
    reject: (id) => `/admin/photos/${id}/reject`,
  },
  reports: {
    list: '/admin/reports',
    detail: (id) => `/admin/reports/${id}`,
    assign: (id) => `/admin/reports/${id}/assign`,
    resolve: (id) => `/admin/reports/${id}/resolve`,
    dismiss: (id) => `/admin/reports/${id}/dismiss`,
  },
  events: {
    list: '/admin/events',
    detail: (id) => `/admin/events/${id}`,
    create: '/admin/events',
    update: (id) => `/admin/events/${id}`,
    remove: (id) => `/admin/events/${id}`,
    publish: (id) => `/admin/events/${id}/publish`,
    unpublish: (id) => `/admin/events/${id}/unpublish`,
    registrations: (id) => `/admin/events/${id}/registrations`,
    issueReward: (id) => `/admin/events/${id}/issue-reward`,
  },
  premium: {
    plans: '/admin/premium/plans',
    plan: (id) => `/admin/premium/plans/${id}`,
    subscribers: '/admin/premium/subscribers',
    refund: (id) => `/admin/premium/subscribers/${id}/refund`,
    cancel: (id) => `/admin/premium/subscribers/${id}/cancel`,
  },
  interests: {
    list: '/admin/interests',
    create: '/admin/interests',
    update: (id) => `/admin/interests/${id}`,
    remove: (id) => `/admin/interests/${id}`,
    createGroup: '/admin/interests/groups',
  },
  audit: {
    log: '/admin/audit-log',
  },
  notifications: {
    list: '/admin/notifications',
    broadcast: '/admin/notifications/broadcast',
  },
  settings: {
    app: '/admin/settings/app',
    featureFlags: '/admin/settings/feature-flags',
    featureFlag: (key) => `/admin/settings/feature-flags/${key}`,
  },
  ai: {
    suggestions: '/admin/ai/suggestions',
    safetyFlags: '/admin/ai/safety-flags',
  },
}
