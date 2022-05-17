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
import { Link } from 'react-router-dom';
import Base from 'containers/List';
import globalMetadataStore from 'stores/glance/metadata';
import actionConfigs from './actions';

export class Metadata extends Base {
  init() {
    this.store = globalMetadataStore;
  }

  get policy() {
    return 'get_metadef_namespaces';
  }

  get name() {
    return t('metadata');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('Name'),
      dataIndex: 'display_name',
      render: (name, record) => {
        if (name) {
          return (
            <Link
              to={`/configuration-admin/metadata/detail/${record.namespace}`}
            >
              {name}
            </Link>
          );
        }
        return '-';
      },
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
      width: 350,
    },
    {
      title: t('Resource Types'),
      dataIndex: 'resource_type_associations',
      isHideable: true,
      render: (value) => {
        if (value) {
          return value.map((it) => <div key={it.name}>{it.name}</div>);
        }
        return '-';
      },
      stringify: (value) => {
        if (value) {
          return value.map((it) => it.name).join(';');
        }
        return '-';
      },
    },
    {
      title: t('Public'),
      dataIndex: 'public',
      valueRender: 'yesNo',
      isHideable: true,
    },
    {
      title: t('Protected'),
      dataIndex: 'protected',
      valueRender: 'yesNo',
      isHideable: true,
    },
  ];
}

export default inject('rootStore')(observer(Metadata));
