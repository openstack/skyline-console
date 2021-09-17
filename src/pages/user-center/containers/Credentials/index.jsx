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
import { Row, Col } from 'antd';
import Base from 'containers/List';
import { CredentialStore } from 'stores/keystone/credential';
import globalRootStore from 'stores/root';
import rolePermission from 'resources/role';
import { actionConfigs, detailConfigs } from './actions';

export class Credentials extends Base {
  init() {
    this.store = new CredentialStore();
    this.downloadStore = new CredentialStore();
  }

  get isUserDetail() {
    const {
      match: { path },
    } = this.props;
    return path.indexOf('user-admin/detail') >= 0;
  }

  updateFetchParamsByPage = (params) => {
    if (!this.isUserDetail) {
      params.id = globalRootStore.user.user.id;
    }
    return params;
  };

  get rolePermissions() {
    return rolePermission;
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get policy() {
    return 'identity:get_application_credential';
  }

  get name() {
    return t('application credential');
  }

  get actionConfigs() {
    if (this.isUserDetail) {
      return detailConfigs;
    }
    return actionConfigs;
  }

  getColumns = () => {
    const ret = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        hasNoDetail: true,
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        isHideable: true,
      },
      {
        title: t('Expires At'),
        dataIndex: 'expires_at',
        valueRender: 'toLocalTime',
        isHideable: true,
      },
      {
        title: t('Roles'),
        dataIndex: 'roles',
        render: (roles) => (
          <Row gutter={[8]} style={{ maxWidth: 300 }}>
            {roles.map((i) => (
              <Col span={24} key={i.id}>
                {this.rolePermissions[i.name] || i.name}
              </Col>
            ))}
          </Row>
        ),
        stringify: (values) =>
          values.map((i) => this.rolePermissions[i.name] || i.name).join('\n'),
      },
    ];
    return ret;
  };

  get searchFilters() {
    const filters = [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
    return filters;
  }
}

export default inject('rootStore')(observer(Credentials));
