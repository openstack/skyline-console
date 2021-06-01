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

/* eslint-disable no-useless-escape */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Typography } from 'antd';
import { ModalAction } from 'containers/Action';
import { allCanReadPolicy } from 'resources/policy';
import globalAuthCatalogStore from 'stores/keystone/catalog';
import { getOpenRc } from 'resources/openstack-rc';
import FileSaver from 'file-saver';
import styles from './index.less';
// import { DownSquareOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

@inject('rootStore')
@observer
export default class OpenRc extends ModalAction {
  init() {
    this.store = globalAuthCatalogStore;
  }

  static id = 'get-token';

  static title = t('Get OpenRC file');

  componentDidMount() {
    this.getData();
  }

  async getData() {
    await this.store.fetchList({});
    this.exportRcFile();
  }

  get name() {
    return t('Get OpenRC file');
  }

  getModalSize() {
    return 'large';
  }

  get token() {
    const key = 'keystone_token';
    const item = localStorage.getItem(key);
    try {
      return JSON.parse(item) || {};
    } catch (e) {
      return {};
    }
  }

  get showNotice() {
    return false;
  }

  get tokenValue() {
    return this.token.value || '';
  }

  get tokenExpiry() {
    const { expires } = this.token;
    return expires || 0;
  }

  get user() {
    const { user } = this.props.rootStore;
    return user;
  }

  get project() {
    const {
      project: {
        id: projectId = '',
        name: projectName = '',
        domain: { name: projectDomainName } = {},
      } = {},
    } = this.user || {};
    return {
      projectId,
      projectName,
      projectDomainName,
    };
  }

  get openRc() {
    const {
      project: {
        id: projectId = '',
        name: projectName = '',
        domain: { name: projectDomain } = {},
      } = {},
      user: { name: userName = '', domain: { name: userDomain } = {} } = {},
      region,
    } = this.user || {};
    const { data } = this.store.list;
    const { endpoints } = data.filter(
      (service) => service.name === 'keystone'
    )[0];
    const authUrl = endpoints.filter(
      (endpoint) => endpoint.interface === 'public'
    )[0].url;
    const openstackRc = getOpenRc({
      authUrl,
      projectId,
      projectName,
      projectDomain,
      userDomain,
      userName,
      region,
    });
    return openstackRc;
  }

  exportRcFile = () => {
    const blob = new Blob([this.openRc], {
      type: 'text/plain;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'openrc.sh');
  };

  get defaultValue() {
    const value = {
      token: this.tokenValue,
    };
    return value;
  }

  static policy = allCanReadPolicy;

  static allowed = () => Promise.resolve(true);

  get labelCol() {
    return {
      xs: { span: 0 },
      sm: { span: 0 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 24 },
      sm: { span: 24 },
    };
  }

  get formItems() {
    return [
      {
        name: 'token',
        label: '',
        type: 'label',
        component: (
          <Paragraph copyable={{ text: this.openRc }} className={styles.token}>
            <pre>{this.openRc}</pre>
          </Paragraph>
        ),
      },
    ];
  }

  onSubmit = () => Promise.resolve();
}
