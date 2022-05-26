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
import Base from 'components/Form';

export class ConfirmStep extends Base {
  init() {}

  get title() {
    return 'ConfirmStep';
  }

  get name() {
    return 'ConfirmStep';
  }

  allowed = () => Promise.resolve();

  getFlavor() {
    const { context } = this.props;
    const { flavor } = context;
    const { disk, ram, vcpus } = flavor.selectedRows[0];
    return disk
      ? `${vcpus}VCPU/${disk}GiB/${Number.parseInt(ram / 1024, 10)}GiB`
      : `${vcpus}VCPU/${Number.parseInt(ram / 1024, 10)}GiB`;
  }

  getSourceValue() {
    const { context } = this.props;
    const { selectedRows = [], selectedRowKeys = [] } = context.image;
    return selectedRows.length ? selectedRows[0].name : selectedRowKeys[0];
  }

  getVirtualLANs() {
    const { context } = this.props;
    const { networks } = context;
    const values = networks.map((it) => {
      const { networkOption, subnetOption, ipTypeOption, ip } = it.value;
      const subnet =
        ipTypeOption.value === 1 ? subnetOption.name || subnetOption.label : '';
      return `${networkOption.name || networkOption.label} ${
        ipTypeOption.label
      } ${subnet} ${ipTypeOption.value === 1 ? ip : ''}`;
    });
    return values;
    // return values.join(<br />);
  }

  getSecurityGroups() {
    const { context } = this.props;
    const { securityGroup: { selectedRows = [] } = {} } = context;
    const values = selectedRows.map((it) => it.name);
    return values;
  }

  getLoginType() {
    const { context } = this.props;
    const { loginType, keypair } = context;
    const { value, label } = loginType;
    return `${label} ${
      value === 'keypair' ? keypair.selectedRows[0].name : ''
    }`;
  }

  goStep(index) {
    const { goStep } = this.props;
    goStep && goStep(index);
  }

  get defaultValue() {
    return {
      autoRelease: false,
    };
  }

  get formItems() {
    const { context } = this.props;
    return [
      {
        name: 'confirm-count',
        label: t('Count'),
        type: 'label',
        content: context.count || 1,
      },
      {
        name: 'confirm-config',
        label: t('Config Overview'),
        type: 'descriptions',
        title: t('Base Config'),
        onClick: () => {
          this.goStep(0);
        },
        items: [
          {
            label: t('Available Zone'),
            value: context.availableZone.label,
          },
          {
            label: t('Project'),
            value: context.project,
          },
          {
            label: t('Flavor'),
            value: this.getFlavor(),
          },
          {
            label: t('Image Name'),
            value: this.getSourceValue(),
          },
        ],
      },
      {
        type: 'short-divider',
      },
      {
        name: 'confirm-config-network',
        label: ' ',
        type: 'descriptions',
        title: t('Network Config'),
        onClick: () => {
          this.goStep(1);
        },
        items: [
          {
            label: t('Virtual LAN'),
            value: this.getVirtualLANs(),
            span: 1,
          },
          {
            label: t('Security Group'),
            value: this.getSecurityGroups(),
            span: 1,
          },
        ],
      },
      {
        type: 'short-divider',
      },
      {
        name: 'confirm-config-system',
        label: ' ',
        type: 'descriptions',
        title: t('System Config'),
        onClick: () => {
          this.goStep(2);
        },
        items: [
          {
            label: t('Name'),
            value: context.name,
          },
          {
            label: t('Login Type'),
            value: this.getLoginType(),
          },
        ],
      },
    ];
  }
}

export default inject('rootStore')(observer(ConfirmStep));
