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
import globalShareAccessRuleStore from 'stores/manila/share-access-rule';
import { keyValueValidator } from 'pages/share/containers/ShareType/actions/Create';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { updateAddSelectValueToObj, getOptions } from 'utils/index';
import { shareAccessLevel, shareAccessType } from 'resources/manila/share';

export const metadataFormItem = {
  name: 'metadata',
  label: t('Metadata'),
  type: 'add-select',
  itemComponent: KeyValueInput,
  addText: t('Add Metadata'),
  keySpan: 8,
  validator: keyValueValidator,
};

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Add Access Rule');

  get name() {
    return t('add access rule');
  }

  static get modalSize() {
    return 'middle';
  }

  getModalSize() {
    return 'middle';
  }

  init() {
    this.store = globalShareAccessRuleStore;
  }

  static policy = 'share:allow_access';

  static allowed = () => Promise.resolve(true);

  get typeOptions() {
    return getOptions(shareAccessType);
  }

  get levelOptions() {
    return getOptions(shareAccessLevel);
  }

  get typeTip() {
    return t(
      "'ip' rule represents IPv4 or IPv6 address, 'cert' rule represents TLS certificate, 'user' rule represents username or usergroup, 'cephx' rule represents ceph auth ID."
    );
  }

  get nameForStateUpdate() {
    return ['access_type'];
  }

  getAccessExtra() {
    const { access_type: type } = this.state;
    const { detail: { share_proto: proto } = {} } = this.containerProps || {};
    const ipTipTypes = ['NFS', 'CIFS'];
    if (ipTipTypes.includes(proto) && type === 'ip') {
      return t('All network segments are indicated by "0.0.0.0/0"');
    }
    return '';
  }

  get formItems() {
    return [
      {
        name: 'access_type',
        label: t('Access Type'),
        type: 'select',
        options: this.typeOptions,
        required: true,
        tip: this.typeTip,
      },
      {
        name: 'access_level',
        label: t('Access Level'),
        type: 'select',
        options: this.levelOptions,
        required: true,
      },
      {
        name: 'access_to',
        label: t('Access To'),
        type: 'input',
        required: true,
        extra: this.getAccessExtra(),
      },
      metadataFormItem,
    ];
  }

  onSubmit = (values, containerProps) => {
    const { detail: { id } = {} } = containerProps;
    const { metadata, ...rest } = values;
    const body = {
      ...rest,
      metadata: updateAddSelectValueToObj(metadata),
    };
    return this.store.create(id, body);
  };
}

export default inject('rootStore')(observer(Create));
