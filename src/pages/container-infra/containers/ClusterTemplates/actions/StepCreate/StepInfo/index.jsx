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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';

export class StepInfo extends Base {
  get title() {
    return t('Info');
  }

  get name() {
    return t('Info');
  }

  get isEdit() {
    return !!this.props.extra;
  }

  get isStep() {
    return true;
  }

  get defaultValue() {
    let values = {};

    if (this.isEdit) {
      const {
        extra: {
          name,
          coe,
          public: publics,
          hidden,
          registry_enabled,
          tls_disabled,
        } = {},
      } = this.props;
      values = {
        name,
        coe,
        public: publics,
        hidden,
        registry_enabled,
        tls_disabled,
      };
    }
    return values;
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Cluster Template Name'),
        type: 'input',
        placeholder: t('Please input cluster template name'),
        required: true,
      },
      {
        name: 'coe',
        label: t('COE'),
        type: 'select',
        options: [
          {
            label: t('Kubernetes'),
            value: 'kubernetes',
          },
          {
            label: t('Docker Swarm'),
            value: 'swarm',
          },
          {
            label: t('Docker Swarm Mode'),
            value: 'swarm-mode',
          },
          {
            label: t('Mesos'),
            value: 'mesos',
          },
          {
            label: t('DC/OS'),
            value: 'dcos',
          },
        ],
        required: true,
      },
      {
        name: 'public',
        label: t('Public'),
        type: 'check',
      },
      {
        name: 'hidden',
        label: t('Hidden'),
        type: 'check',
      },
      {
        name: 'registry_enabled',
        label: t('Enable Registry'),
        type: 'check',
      },
      {
        name: 'tls_disabled',
        label: t('Disable TLS'),
        type: 'check',
      },
    ];
  }
}

export default inject('rootStore')(observer(StepInfo));
