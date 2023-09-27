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
import { isDomain } from 'utils/validate';
import { certificateMode } from 'resources/octavia/lb';
import {
  certificateContentTip,
  certificateKeyPairTip,
} from 'resources/octavia/secrets';
import globalContainersStore from 'stores/barbican/containers';
import moment from 'moment';
import { parse } from 'qs';

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

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get defaultValue() {
    const data = {
      mode: this.typeTab,
    };
    return data;
  }

  get typeTab() {
    const { location: { search = '' } = {} } = this.containerProps;
    const params = parse(search.slice(1));
    return params.tab || 'SERVER';
  }

  get certificateModeOptions() {
    return getOptions(certificateMode).filter((it) => {
      return it.value === this.typeTab;
    });
  }

  get certificateContentTip() {
    return certificateContentTip;
  }

  get certificateKeyPairTip() {
    return certificateKeyPairTip;
  }

  validateDomain = (rule, value) => {
    if ([undefined, null, ''].includes(value)) return Promise.resolve();
    const domains = value.split(',');
    const allCorrect = domains.every((it) => it.length <= 100 && isDomain(it));
    if (domains.length > 30 || !allCorrect) {
      return Promise.reject(
        t('Please enter a correct domain, format is refer to the left tip!')
      );
    }
    return Promise.resolve();
  };

  validateCertificateContent = (rule, value) => {
    if (!value) return Promise.reject();
    const keys = value.split(/\n/g);
    const start = keys[0];
    const end = keys[keys.length - 1] || keys[keys.length - 2]; // Compatible with last blank line
    if (
      start === '-----BEGIN CERTIFICATE-----' &&
      end === '-----END CERTIFICATE-----'
    ) {
      return Promise.resolve();
    }
    return Promise.reject(
      t(
        'Please enter a correct certificate content, format is refer to the left tip!'
      )
    );
  };

  validateCertificateKeyPair = (rule, value) => {
    if (!value) return Promise.reject();
    const keys = value.split(/\n/g);
    const start = keys[0];
    const end = keys[keys.length - 1] || keys[keys.length - 2];
    if (
      start === '-----BEGIN RSA PRIVATE KEY-----' &&
      end === '-----END RSA PRIVATE KEY-----'
    ) {
      return Promise.resolve();
    }
    return Promise.reject(
      t('Please enter a correct private key, format is refer to the left tip!')
    );
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
        tip: this.certificateContentTip,
        required: true,
        rows: 6,
      },
      {
        name: 'private_key',
        label: t('Private Key'),
        type: 'textarea-from-file',
        placeholder: t('PEM encoding'),
        accept: '.key,.pem',
        tip: this.certificateKeyPairTip,
        required: true,
        display: mode === 'SERVER',
        rows: 6,
      },
      {
        name: 'domain',
        label: t('Domain Name'),
        type: 'textarea',
        placeholder: t('Please input'),
        maxLength: 1024,
        hidden: mode === 'CA',
        validator: this.validateDomain,
        tip: t(
          'The domain name can only be composed of letters, numbers, dashes, in A dash cannot be at the beginning or end, and a single string cannot exceed more than 63 characters, separated by dots; At most can support 30 domain names, separated by commas;The length of a single domain name does not exceed 100 characters, and the total length degree does not exceed 1024 characters.'
        ),
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
