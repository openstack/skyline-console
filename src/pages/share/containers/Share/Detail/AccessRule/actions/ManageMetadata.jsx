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
import globalShareAccessRuleStore from 'stores/manila/share-access-rule';
import { ModalAction } from 'containers/Action';
import {
  updateAddSelectValueToObj,
  updateObjToAddSelectArray,
} from 'utils/index';
import { metadataFormItem } from './Create';

export class ManageMetadata extends ModalAction {
  static id = 'manage-metadata';

  static title = t('Manage Metadata');

  init() {
    this.store = globalShareAccessRuleStore;
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  static policy = [
    'share_access_metadata:update',
    'share_access_metadata:delete',
  ];

  static allowed = () => Promise.resolve(true);

  get messageHasItemName() {
    return false;
  }

  get name() {
    return t('Manage Metadata');
  }

  get defaultValue() {
    const { metadata } = this.item;
    return {
      metadata: updateObjToAddSelectArray(metadata || {}),
    };
  }

  get formItems() {
    return [metadataFormItem];
  }

  onSubmit = (values) => {
    const { metadata = {} } = values;
    const { id, metadata: oldValue = {} } = this.item;
    const newValue = updateAddSelectValueToObj(metadata);
    const dels = Object.keys(oldValue).filter(
      (key) => !Object.keys(newValue).includes(key)
    );
    return this.store.manageMetadata(id, newValue, dels);
  };
}

export default inject('rootStore')(observer(ManageMetadata));
