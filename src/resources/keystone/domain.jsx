// Copyright 2021 99cloud
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

import React from 'react';
import { Badge } from 'antd';
import { getIdRender } from 'utils/table';
import globalDomainStore from 'stores/keystone/domain';
import globalRootStore from 'src/stores/root';

export const statusTypes = [
  {
    label: t('Enable'),
    value: true,
  },
  {
    label: t('Disable'),
    value: false,
  },
];

export const getDomainOptions = (self) => {
  const { baseDomains } = globalRootStore;
  const { domains } = globalDomainStore;
  const domainList = (domains || []).filter(
    (it) =>
      (baseDomains.indexOf(it.name) === -1 ||
        it.id === (self.item || {}).domain_id) &&
      !!it.enabled
  );
  return domainList.map((it) => ({
    label: it.name,
    value: it.id,
    key: it.id,
  }));
};

export const getCheckedOptions = () => {
  const { domains } = globalDomainStore;
  return (domains || []).map((it) => ({
    label: it.name,
    value: it.id,
    key: it.id,
  }));
};

export const getDomainFormItem = (self) => {
  return {
    name: 'domain_id',
    label: t('Affiliated Domain'),
    type: 'select',
    checkOptions: getCheckedOptions(),
    checkBoxInfo: t('Show All Domains'),
    options: getDomainOptions(self),
    allowClear: false,
    onChange: (e) => {
      self.setState({
        domain: e,
      });
    },
    required: true,
  };
};

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

export const domainColumn = {
  dataIndex: 'domainName',
  title: t('Domain ID/Name'),
  render: (value, record) => {
    return (
      <>
        <div>{getIdRender(record.domain_id, true, false)}</div>
        <div>{value}</div>
      </>
    );
  },
};

export const projectDomainColumns = [
  {
    dataIndex: 'name',
    title: t('Project ID/Name'),
    render: (value, record) => {
      return (
        <>
          <div>{getIdRender(record.id, true, false)}</div>
          <div>{value}</div>
        </>
      );
    },
  },
  domainColumn,
];

export const userDomainColumns = [
  {
    dataIndex: 'name',
    title: t('User ID/Name'),
    render: (value, record) => {
      return (
        <>
          <div>{getIdRender(record.id, true, false)}</div>
          <div>{value}</div>
        </>
      );
    },
  },
  domainColumn,
];

export const groupDomainColumns = [
  {
    dataIndex: 'name',
    title: t('User Group ID/Name'),
    render: (value, record) => {
      return (
        <>
          <div>{getIdRender(record.id, true, false)}</div>
          <div>{value}</div>
        </>
      );
    },
  },
  domainColumn,
];

export const transferFilterOption = (inputValue, record) => {
  const { domainName, name, id } = record;
  return (
    id.includes(inputValue) ||
    name.includes(inputValue) ||
    domainName.includes(inputValue)
  );
};
