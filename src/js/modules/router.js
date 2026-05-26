export const views = {
  list: 'list-view',
  detail: 'detail-view',
  profile: 'profile-view',
  settings: 'settings-view',
};

export function navigateTo(viewName, payload = {}) {
  console.log(`Navigation vers ${viewName}`, payload);
  return viewName;
}
