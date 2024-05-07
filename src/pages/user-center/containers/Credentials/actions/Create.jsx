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
import globalCredentialStore from 'stores/keystone/credential';
import moment from 'moment';
import globalRootStore from 'stores/root';
import { toJS } from 'mobx';
import FileSaver from 'file-saver';

export class Create extends ModalAction {
  static id = 'create-application_credentials';

  static title = t('Create Application Credentials');

  static get modalSize() {
    return 'middle';
  }

  getModalSize() {
    return 'middle';
  }

  get name() {
    return t('Create Application Credentials');
  }

  onSubmit = (values) => {
    if (values.expires_at) {
      values.expires_at = values.expires_at.clone().endOf('day');
    }
    if (values.roles) {
      values.roles = Object.keys(values.roles)
        .filter((key) => values.roles[key])
        .map((i) => ({ id: i }));
    }
    return globalCredentialStore.create(values).then((res) => {
      const { links, roles, system, unrestricted, user_id, name, ...rest } =
        res.application_credential;
      const filename = `${name}.json`;
      const blob = new Blob([JSON.stringify(rest, null, 2)], {
        type: 'text/plain;charset=utf-8',
      });
      FileSaver.saveAs(blob, filename);
    });
  };

  static allowed() {
    return Promise.resolve(true);
  }

  static policy = 'identity:create_application_credential';

  get roleOptions() {
    const roles = toJS(globalRootStore.roles);

    return roles.map((i) => ({
      label: i.name,
      value: i.id,
    }));
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'expires_at',
        label: t('Expires At'),
        type: 'date-picker',
        showToday: false,
        disabledDate: (current) =>
          current && current < moment().subtract(1, 'days').endOf('d'),
        required: false,
      },
      {
        name: 'roles',
        label: t('Roles'),
        type: 'check-group',
        options: this.roleOptions,
        extra: t(
          'If not provided, the roles assigned to the application credential will be the same as the roles in the current token.'
        ),
        span: 12,
      },
      {
        name: 'unrestricted',
        label: t('Unrestricted'),
        type: 'check',
        content: t('Unrestricted'),
        extra: t(
          'By default, for security reasons, application credentials are forbidden from being used for creating or destructing additional application credentials or keystone trusts. If your application credential needs to be able to perform these actions, check unrestricted.'
        ),
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
    ];
  }
}

export default inject('rootStore')(observer(Create));
