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

import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { allCanReadPolicy } from 'resources/skyline/policy';
import globalAuthCatalogStore from 'stores/keystone/catalog';
import {
  getCredentialOpenRc,
  getPwdOpenRc,
} from 'resources/keystone/openstack-rc';
import FileSaver from 'file-saver';

export class OpenRc extends ModalAction {
  init() {
    this.store = globalAuthCatalogStore;
  }

  static id = 'get-token';

  static title = t('Get OpenRC file');

  get name() {
    return t('Get OpenRC file');
  }

  get showNotice() {
    return false;
  }

  get user() {
    const { user } = this.props.rootStore;
    return user;
  }

  getOpenRC(type) {
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
    let openstackRc = '';
    if (type === 'password') {
      openstackRc = getPwdOpenRc({
        authUrl,
        projectId,
        projectName,
        projectDomain,
        userDomain,
        userName,
        region,
      });
    } else {
      openstackRc = getCredentialOpenRc({
        authUrl,
        region,
      });
    }

    return openstackRc;
  }

  exportRcFile = (data) => {
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'openrc.sh');
  };

  get defaultValue() {
    const value = {
      type: 'password',
    };
    return value;
  }

  static policy = allCanReadPolicy;

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'type',
        label: t('Type'),
        type: 'select',
        options: [
          {
            label: t('Password Type'),
            value: 'password',
          },
          {
            label: t('Credential Type'),
            value: 'credential',
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { type } = values;
    return this.store.fetchList().then(() => {
      return this.exportRcFile(this.getOpenRC(type));
    });
  };
}

export default inject('rootStore')(observer(OpenRc));
