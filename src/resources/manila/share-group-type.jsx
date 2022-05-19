import React from 'react';

export const shareGroupTypeColumns = [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    routeName: 'shareGroupTypeDetailAdmin',
  },
  {
    title: t('Public'),
    dataIndex: 'is_public',
    valueRender: 'yesNo',
  },
  {
    title: t('Share Types'),
    dataIndex: 'shareTypes',
    render: (value) => {
      return (value || []).map((it) => <div key={it.id}>{it.name}</div>);
    },
    stringify: (value) => {
      return (value || []).map((it) => it.name).join(';') || '-';
    },
  },
];

export const shareGroupTypeFilters = [
  {
    name: 'name',
    label: t('Name'),
  },
];
