import { grafanaApi } from 'src/apis/grafanaApi';

export const Monitor = {
  id: 'monitor',
  actionType: 'asyncCallback',
  title: t('Monitor'),
  allowed: () => true,
  buttonClassName: 'monitor',
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
