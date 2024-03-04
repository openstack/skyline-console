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
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { generateId } from 'utils/index';

import globalAuthCatalogStore from 'stores/keystone/catalog';

export class Catalog extends Base {
  init() {
    this.store = globalAuthCatalogStore;
  }

  get policy() {
    return 'identity:get_auth_catalog';
  }

  get name() {
    return t('services');
  }

  get hasTab() {
    return true;
  }

  getColumns = () => [
    {
      title: t('Name'),
      dataIndex: 'name',
      width: 150,
    },
    {
      title: t('Service'),
      dataIndex: 'type',
      isHideable: true,
      width: 150,
    },
    {
      title: t('Region'),
      dataIndex: 'region',
      isHideable: true,
      width: 150,
      render: (value) => value || '-',
    },
    {
      title: t('Endpoints'),
      dataIndex: 'endpoints',
      isHideable: true,
      render: (value) => {
        if (value.length) {
          return value.map((it) => (
            <div key={`endpoint-${generateId()}`}>
              <b>{it.interface}: </b>
              <span>{it.url}</span>
            </div>
          ));
        }
        return '-';
      },
      stringify: (value) => {
        if (value.length) {
          return value.map((it) => `${it.interface}: ${it.url}`).join('\n');
        }
        return '-';
      },
    },
  ];

  get searchFilters() {
    return [];
  }
}

export default inject('rootStore')(observer(Catalog));
