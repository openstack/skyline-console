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
import { consumerTypes } from 'resources/cinder/volume-type';
import globalQosSpecStore from 'stores/cinder/qos-spec';
import actionConfigs from './actions';

export class QosSpecs extends Base {
  init() {
    this.store = globalQosSpecStore;
  }

  get policy() {
    return 'volume_extension:qos_specs_manage:get_all';
  }

  get name() {
    return t('qos specs');
  }

  get hasTab() {
    return true;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: 'volumeTypeQosDetailAdmin',
    },
    {
      title: t('Consumer'),
      dataIndex: 'consumer',
      isHideable: true,
      valueMap: consumerTypes,
    },
    {
      title: t('Specs'),
      dataIndex: 'specs',
      isHideable: true,
      render: (value) => {
        if (value && JSON.stringify(value) !== '{}') {
          return Object.entries(value).map(([key, val]) => {
            return (
              <div key={key}>
                {key}={val}
              </div>
            );
          });
        }
        return '-';
      },
      stringify: (value) => {
        if (value && JSON.stringify(value) !== '{}') {
          return Object.entries(value)
            .map(([key, val]) => {
              return `${key}=${val}`;
            })
            .join('\n');
        }
        return '-';
      },
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }

  get fetchDataByAllProjects() {
    return false;
  }
}

export default inject('rootStore')(observer(QosSpecs));
