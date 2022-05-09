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
import { getOptions } from 'utils/index';
import { certificateMode } from 'resources/octavia/lb';
import globalContainersStore from 'stores/barbican/containers';
import moment from 'moment';

export class CreateAction extends ModalAction {
  static id = 'create-certificate';

  static title = t('Create Certificate');

  static policy = ['secrets:post', 'containers:post'];

  init() {
    this.store = globalContainersStore;
  }

  get name() {
    return t('Create Certificate');
  }

  get defaultValue() {
    const data = {
      mode: 'SERVER',
    };
    return data;
  }

  get certificateModeOptions() {
    return getOptions(certificateMode);
  }

  validateDomain = (rule, value) => {
    if (value === undefined || value === '') return Promise.resolve();
    const urlReg = /^https?:\/\/(.*)/;
    if (!urlReg.test(value)) {
      return Promise.reject(
        t(
          'Please enter a correct domain starting with "http://" or "https://"!'
        )
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    const { mode } = this.state;
    return [
      {
        name: 'name',
        label: t('Certificate Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'mode',
        label: t('Certificate Type'),
        type: 'radio',
        options: this.certificateModeOptions,
      },
      {
        name: 'certificate',
        label: t('Certificate Content'),
        type: 'textarea-from-file',
        placeholder: t('PEM encoding'),
        accept: '.crt,.pem',
        required: true,
      },
      {
        name: 'private_key',
        label: t('Private Key'),
        type: 'textarea-from-file',
        placeholder: t('PEM encoding'),
        accept: '.key,.pem',
        required: true,
        display: mode === 'SERVER',
      },
      {
        name: 'domain',
        label: t('Domain Name'),
        type: 'input',
        placeholder: t('Please input'),
        hidden: mode === 'CA',
        validator: this.validateDomain,
        extra: t(
          'If it is an SNI type certificate, a domain name needs to be specified'
        ),
      },
      {
        name: 'expiration',
        label: t('Expires At'),
        type: 'date-picker',
        showToday: false,
        disabledDate: (current) => current && current <= moment().endOf('d'),
      },
    ];
  }

  static allowed = () => Promise.resolve(true);

  onSubmit = (values) => {
    return this.store.create(values);
  };
}

export default inject('rootStore')(observer(CreateAction));
