export const GoToGrafana = {
  id: 'go-to-grafana',
  actionType: 'link',
  title: t('Go to Grafana'),
  allowed: () => true,
  // TODO: Replace this URL with API data or env variable.
  path: 'https://localhost:1234/grrrrrfana',
  target: '_blank',
  buttonClassName: 'go-to-grafana',
};
