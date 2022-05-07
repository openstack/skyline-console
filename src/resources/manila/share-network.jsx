import React from 'react';
import PopoverSubnets from 'components/Popover/PopoverSubnets';
import PopoverNetworks from 'components/Popover/PopoverNetworks';

export const getShareNetworkColumns = (self) => {
  return [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: self.getRouteName('shareNetworkDetail'),
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !self.isAdminPage,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
    },
    {
      title: t('Neutron Net'),
      dataIndex: 'networks',
      render: (_, record) => {
        const { share_network_subnets: subnets = [] } = record;
        const links = subnets.map((it) => {
          const { neutron_net_id: id } = it;
          const link = self.getLinkRender('networkDetail', id, { id });
          return <div key={it.id}>{link}</div>;
        });
        const networkIds = subnets.map((it) => it.neutron_net_id);
        return (
          <>
            {links} <PopoverNetworks networkIds={networkIds} />
          </>
        );
      },
      stringify: (_, record) => {
        const { share_network_subnets: subnets = [] } = record;
        return (subnets || []).map((it) => it.neutron_net_id).join(', ');
      },
    },
    {
      title: t('Neutron Subnet'),
      dataIndex: 'share_network_subnets',
      render: (_, record) => {
        const { share_network_subnets: subnets = [] } = record;
        const idItems = subnets.map((it) => {
          const { neutron_subnet_id } = it;
          return <div key={it.id}>{neutron_subnet_id}</div>;
        });
        const ids = subnets.map((it) => it.neutron_subnet_id);
        return (
          <>
            {idItems} <PopoverSubnets subnetIds={ids} />
          </>
        );
      },
      stringify: (_, record) => {
        const { share_network_subnets: subnets = [] } = record;
        return (subnets || []).map((it) => it.neutron_subnet_id).join(', ');
      },
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      isHideable: true,
      valueRender: 'sinceTime',
    },
  ];
};

export const shareNetworkFilters = [
  {
    name: 'name',
    label: t('Name'),
  },
];
