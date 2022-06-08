export const operatingStatusCodes = {
  ONLINE: t('Online'),
  DRAINING: t('Draining'),
  OFFLINE: t('Offline'),
  DEGRADED: t('Degraded'),
  ERROR: t('Error'),
  NO_MONITOR: t('No Monitor'),
};

export const provisioningStatusCodes = {
  ACTIVE: t('Active'),
  DELETED: t('Deleted'),
  ERROR: t('Error'),
  PENDING_CREATE: t('Pending Create'),
  PENDING_UPDATE: t('Pending Update'),
  PENDING_DELETE: t('Pending Delete'),
};

export const certificateMode = {
  SERVER: t('Server Certificate'),
  CA: t('CA Certificate'),
};

export const certificateStatus = {
  ACTIVE: t('Active'),
  ERROR: t('Error'),
};

export const getCertificateColumns = (self) => [
  {
    title: t('Name'),
    dataIndex: 'name',
  },
  {
    title: t('Certificate Type'),
    dataIndex: 'mode',
    render: (value) => certificateMode[value] || value,
  },
  {
    title: t('Expires At'),
    dataIndex: 'expiration',
    valueRender: 'toLocalTime',
  },
  {
    title: t('Domain Name'),
    dataIndex: 'domain',
    render: (value) => value || '-',
  },
  {
    title: t('Listener'),
    dataIndex: 'listener',
    render: (value) => {
      return value
        ? self.getLinkRender(
            'lbListenerDetail',
            value.name,
            {
              loadBalancerId: value.lb,
              id: value.id,
            },
            null
          )
        : '-';
    },
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    render: (value) => certificateStatus[value] || value,
  },
  {
    title: t('Created At'),
    dataIndex: 'created',
    valueRender: 'toLocalTime',
  },
];

export const sslParseMethod = [
  {
    label: t('One-way authentication'),
    value: 'one-way',
  },
  {
    label: t('Two-way authentication'),
    value: 'two-way',
  },
];

export const listenerProtocols = [
  {
    label: 'HTTP',
    value: 'HTTP',
  },
  {
    label: 'TCP',
    value: 'TCP',
  },
  {
    label: 'HTTPS',
    value: 'TERMINATED_HTTPS',
  },
  {
    label: 'UDP',
    value: 'UDP',
  },
];

export const poolProtocols = [
  {
    label: 'HTTP',
    value: 'HTTP',
  },
  {
    label: 'TCP',
    value: 'TCP',
  },
  {
    label: 'UDP',
    value: 'UDP',
  },
];

export const healthProtocols = [
  {
    label: 'HTTP',
    value: 'HTTP',
  },
  {
    label: 'TCP',
    value: 'TCP',
  },
  {
    label: 'UDP',
    value: 'UDP-CONNECT',
  },
];
