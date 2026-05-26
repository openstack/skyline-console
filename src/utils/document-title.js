import i18n from 'core/i18n';

const DEFAULT_TITLE = 'Cloud';

const getDefaultTitle = () => i18n.t(DEFAULT_TITLE) || DEFAULT_TITLE;

export const getSiteTitle = (info = {}) => {
  const { title = {} } = info || {};
  const language = i18n.getLocaleShortName();
  return title[language] || title.en || getDefaultTitle();
};

export const getRouteTitle = (routes = []) =>
  routes
    .map((route) => (typeof route.name === 'string' ? route.name.trim() : ''))
    .filter(Boolean)
    .reverse()
    .join(' - ');

export const getDocumentTitle = (routes = [], siteTitle) => {
  const baseTitle = siteTitle || getDefaultTitle();
  const routeTitle = getRouteTitle(routes);
  return routeTitle ? `${routeTitle} - ${baseTitle}` : baseTitle;
};
