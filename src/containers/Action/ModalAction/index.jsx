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

import { firstUpperCase } from 'utils/index';
import BaseForm from 'components/Form';

export default class ModalAction extends BaseForm {
  static id = 'modalAction';

  static actionType = 'modal';

  static title = t('Edit');

  static buttonType = 'primary';

  static isDanger = false;

  static policy = '';

  static aliasPolicy = '';

  get name() {
    return t('Edit');
  }

  get isModal() {
    return true;
  }

  static get modalSize() {
    return 'small';
  }

  getModalSize() {
    return 'small';
  }

  getRightExtraSpan() {
    const size = this.getModalSize();
    const isLargeSize = size === 'large';
    const left = isLargeSize ? 20 : 18;
    const right = isLargeSize ? 4 : 6;
    return {
      left,
      right,
    };
  }

  static get showQuota() {
    return false;
  }

  get showQuota() {
    return false;
  }

  get labelCol() {
    const size = this.getModalSize();
    if (size === 'large') {
      return {
        xs: { span: 6 },
        sm: { span: 4 },
      };
    }
    return {
      xs: { span: 8 },
      sm: { span: 6 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 16 },
      sm: { span: 16 },
    };
  }

  static allowed() {
    return Promise.resolve();
  }

  get messageHasItemName() {
    return true;
  }

  get instanceName() {
    return (this.item || {}).name || (this.values || {}).name || this.itemId;
  }

  get isAsyncAction() {
    return false;
  }

  get successText() {
    if (this.messageHasItemName) {
      if (this.isAsyncAction) {
        return firstUpperCase(
          t(
            'The {action} instruction has been issued, instance: {name}. \n You can wait for a few seconds to follow the changes of the list data or manually refresh the data to get the final display result.',
            { action: this.name.toLowerCase(), name: this.instanceName }
          )
        );
      }
      return firstUpperCase(
        t('{action} successfully, instance: {name}.', {
          action: this.name.toLowerCase(),
          name: this.instanceName,
        })
      );
    }
    if (this.isAsyncAction) {
      return firstUpperCase(
        t(
          'The {action} instruction has been issued. \n You can wait for a few seconds to follow the changes of the list data or manually refresh the data to get the final display result.',
          { action: this.name.toLowerCase() }
        )
      );
    }
    return firstUpperCase(t('{action} successfully.', { action: this.name }));
  }

  get errorText() {
    if (this.messageHasItemName) {
      return t('Unable to {action}, instance: {name}.', {
        action: this.name.toLowerCase(),
        name: this.instanceName,
      });
    }
    return t('Unable to {action}.', { action: this.name.toLowerCase() });
  }

  get containerProps() {
    return this.props.containerProps || {};
  }

  get isAdminPage() {
    const { isAdminPage = false } = this.containerProps;
    return isAdminPage;
  }

  get item() {
    const { item } = this.props;
    return item || this.containerProps.detail || { name: '' };
  }

  get itemId() {
    return (this.item || {}).id;
  }

  get actionId() {
    const { action } = this.props;
    return action?.id;
  }

  get items() {
    const { items } = this.props;
    return items;
  }

  get defaultValue() {
    const { name = '' } = this.item;
    const value = {
      name,
    };
    return value;
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        placeholder: t('Please input name'),
      },
    ];
  }

  // eslint-disable-next-line no-unused-vars
  onSubmit = (values) => Promise.resolve();
}
