import React from 'react';
import { Badge } from 'antd';

export const statusTypes = [
  {
    label: t('Enable'),
    value: true,
  },
  {
    label: t('Forbidden'),
    value: false,
  },
];

export const enabledColumn = {
  title: t('Enabled'),
  dataIndex: 'enabled',
  isHideable: true,
  render: (val) => {
    if (val === true) {
      return <Badge color="green" text={t('Yes')} />;
    }
    return <Badge color="red" text={t('No')} />;
  },
  stringify: (val) => (val ? t('Yes') : t('No')),
};
