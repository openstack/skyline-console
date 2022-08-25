export const shareGroupStatus = {
  available: t('Available'),
  error: t('Error'),
  creating: t('Creating'),
  deleting: t('Deleting'),
};

export const getShareGroupColumns = (self) => {
  return [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: self.getRouteName('shareGroupDetail'),
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !self.isAdminPage,
      sortKey: 'project_id',
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
      sorter: false,
    },
    {
      title: t('Availability Zone'),
      dataIndex: 'availability_zone',
      sorter: false,
    },
    {
      title: t('Share Network'),
      dataIndex: 'share_network_id',
      render: (value) => {
        if (!value) {
          return '-';
        }
        const link = self.getLinkRender('shareNetworkDetail', value, {
          id: value,
        });
        return link;
      },
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      valueMap: shareGroupStatus,
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      isHideable: true,
      valueRender: 'sinceTime',
    },
  ];
};

export const shareGroupFilters = [
  {
    label: t('Name'),
    name: 'name',
  },
];
