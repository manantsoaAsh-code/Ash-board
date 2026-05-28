export const views = {
  list: 'list-view',
  detail: 'detail-page',
  profile: 'profile-page',
  settings: 'settings-page',
};

export function navigateTo(viewName, payload = {}) {
  console.log(`Navigation vers ${viewName}`, payload);
  return viewName;
}
