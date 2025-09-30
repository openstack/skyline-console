// Copyright 2022 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { isEmpty } from 'lodash';
import React from 'react';

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
    valueMap: certificateMode,
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
        ? value.map((it) => (
            <div key={it.id}>
              {self.getLinkRender(
                'lbListenerDetail',
                it.name,
                {
                  loadBalancerId: it.lb,
                  id: it.id,
                },
                null
              )}
            </div>
          ))
        : '-';
    },
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    valueMap: certificateStatus,
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

export const INSERT_HEADERS = {
  'X-Forwarded-For': t('Specify the client IP address'),
  'X-Forwarded-Port': t('Specify the listener port'),
  'X-Forwarded-Proto': t('When true this header is inserted'),
};

export const insertHeaderOptions = Object.keys(INSERT_HEADERS).map((key) => ({
  label: key,
  value: key,
}));

export const insertHeaderTips = (
  <>
    {Object.keys(INSERT_HEADERS).map((key) => {
      return (
        <p key={key}>
          {key}: {INSERT_HEADERS[key]}
        </p>
      );
    })}
  </>
);

export const insertHeaderDesc = t(
  'The optional headers to insert into the request before it is sent to the backend member.'
);

export const getListenerInsertHeadersFormItem = () => {
  return {
    name: 'insert_headers',
    label: t('Custom Headers'),
    type: 'check-group',
    extra: insertHeaderDesc,
    tip: insertHeaderTips,
    options: insertHeaderOptions,
  };
};

export const getInsertHeadersValueFromForm = (values) => {
  if (!values) {
    return null;
  }
  const result = {};
  Object.keys(INSERT_HEADERS).forEach((key) => {
    if (values[key]) {
      result[key] = 'true';
    }
  });
  return isEmpty(result) ? null : result;
};

export const getInsertHeadersFormValueFromListener = (listener) => {
  const { insert_headers } = listener || {};
  const result = {};
  Object.keys(INSERT_HEADERS).forEach((key) => {
    if (insert_headers[key]) {
      result[key] = insert_headers[key] === 'true';
    }
  });
  return result;
};

export const getInsertHeaderCard = (data) => {
  const options = [];
  Object.keys(INSERT_HEADERS).forEach((key) => {
    if (data[key]) {
      options.push({
        label: key,
        content: data[key],
        tooltip: INSERT_HEADERS[key],
      });
    }
  });
  return {
    title: t('Custom Headers'),
    titleHelp: insertHeaderDesc,
    options,
  };
};
