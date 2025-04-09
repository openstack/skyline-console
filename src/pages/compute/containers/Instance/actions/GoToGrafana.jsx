import { grafanaApi } from 'src/apis/grafanaApi';

export const GoToGrafana = {
  id: 'go-to-grafana',
  actionType: 'asyncCallback',
  title: t('Go to Grafana'),
  allowed: () => true,
  buttonClassName: 'go-to-grafana',
  hideInTable: true,
  onClick: async (row) => {
    try {
      const link = await grafanaApi.getInstanceLink(row?.id);
      window.open(link, '_blank');
    } catch (error) {
      console.error('Failed to get instance grafana link: ', error);
    }
  },
};
