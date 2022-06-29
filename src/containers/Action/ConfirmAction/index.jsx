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

import React from 'react';
import { isArray } from 'lodash';
import { firstUpperCase, unescapeHtml } from 'utils/index';

export default class ConfirmAction {
  static actionType = 'confirm';

  constructor(props) {
    const { item, containerProps } = props;
    if (item) {
      this.item = item;
    }
    if (containerProps) {
      this.containerProps = containerProps;
    }
  }

  get id() {
    return 'id';
  }

  get actionType() {
    return 'confirm';
  }

  get actionName() {
    // use actionName || title to generate default message;
    return '';
  }

  get actionNameDisplay() {
    return this.actionName.toLowerCase();
  }

  get passiveAction() {
    return t('be deleted');
  }

  get title() {
    return t('Delete');
  }

  get buttonType() {
    return 'default';
  }

  get isDanger() {
    return false;
  }

  get buttonText() {
    // action button text use buttonText || title
    return '';
  }

  get okText() {
    return t('Confirm');
  }

  get cancelText() {
    return t('Cancel');
  }

  get isAdminPage() {
    const { isAdminPage = false } = this.containerProps || {};
    return isAdminPage;
  }

  get isAsyncAction() {
    return false;
  }

  get messageHasItemName() {
    return true;
  }

  // eslint-disable-next-line no-unused-vars
  policy = '';

  aliasPolicy = '';

  unescape = (message) => unescapeHtml(message);

  getItemId = (data) => data.id;

  getItemName = (data) => data.name || `- (${this.getItemId(data)})`;

  getName = (data) =>
    isArray(data)
      ? data.map((it) => this.getItemName(it)).join(', ')
      : this.getItemName(data);

  // eslint-disable-next-line no-unused-vars
  allowedCheckFunc = (data) => true;

  allowed = (data) => {
    if (isArray(data)) {
      return Promise.all(
        data.map((it) => Promise.resolve(this.allowedCheckFunc(it)))
      );
    }
    return Promise.resolve(this.allowedCheckFunc(data));
  };

  confirmContext = (data) => {
    if (!this.messageHasItemName) {
      return t('Are you sure to {action}?', {
        action: this.actionNameDisplay || this.title,
      });
    }
    const name = this.getName(data);
    return t('Are you sure to {action} (instance: {name})?', {
      action: this.actionNameDisplay || this.title,
      name,
    });
  };

  submitSuccessMsg = (data) => {
    const name = this.getName(data);
    if (this.isAsyncAction) {
      if (!this.messageHasItemName) {
        return firstUpperCase(
          t(
            'The {action} instruction has been issued. \n You can wait for a few seconds to follow the changes of the list data or manually refresh the data to get the final display result.',
            { action: this.actionNameDisplay || this.title }
          )
        );
      }
      return firstUpperCase(
        t(
          'The {action} instruction has been issued, instance: {name}. \n You can wait for a few seconds to follow the changes of the list data or manually refresh the data to get the final display result.',
          { action: this.actionNameDisplay || this.title, name }
        )
      );
    }
    if (!this.messageHasItemName) {
      return firstUpperCase(
        t('{action} successfully.', {
          action: this.actionNameDisplay || this.title,
        })
      );
    }
    return firstUpperCase(
      t('{action} successfully, instance: {name}.', {
        action: this.actionNameDisplay || this.title,
        name,
      })
    );
  };

  performErrorMsg = (data, isBatch) => {
    if (isBatch) {
      if (!this.messageHasItemName) {
        return '';
      }
      const name = this.getName(data);
      return t('instance: {name}.', { name });
    }
    if (!this.messageHasItemName) {
      return t('You are not allowed to {action}.', {
        action: this.actionNameDisplay || this.title,
      });
    }
    const name = this.getName(data);
    return t('You are not allowed to {action}, instance: {name}.', {
      action: this.actionNameDisplay || this.title,
      name,
    });
  };

  submitErrorMsg = (data) => {
    if (!this.messageHasItemName) {
      return t('Unable to {action}.', {
        action: this.actionNameDisplay || this.title,
      });
    }
    const name = this.getName(data);
    return t('Unable to {action}, instance: {name}.', {
      action: this.actionNameDisplay || this.title,
      name,
    });
  };

  // eslint-disable-next-line no-unused-vars
  onSubmit = (data) => Promise.resolve();

  getBatchPerformTitle() {
    if (this.messageHasItemName) {
      return t(
        'There are resources that cannot {action} in the selected resources, such as:',
        { action: this.passiveAction.toLowerCase() }
      );
    }
    return t(
      'There are resources that cannot {action} in the selected resources.',
      { action: this.passiveAction.toLowerCase() }
    );
  }

  perform = async (data) => {
    if (isArray(data)) {
      if (data.length === 0) {
        return Promise.reject(t('Please select item!'));
      }
    }
    const allowedResult = await this.allowed(data);
    if (isArray(data)) {
      const items = isArray(data) ? data : [data];
      if (allowedResult.every((value) => !!value)) {
        return Promise.resolve(true);
      }
      const failedItems = [];
      allowedResult.forEach((value, index) => {
        if (!value) {
          failedItems.push(items[index]);
        }
      });
      const errorMsg = this.unescape(this.performErrorMsg(failedItems, true));
      const title = this.getBatchPerformTitle();
      const msg = (
        <div>
          {title && <p>{title}</p>}
          <p>{errorMsg}</p>
        </div>
      );
      return Promise.reject(msg);
    }
    if (allowedResult) {
      return Promise.resolve(true);
    }
    const errorMsg = this.performErrorMsg(data);
    return Promise.reject(errorMsg);
  };
}
