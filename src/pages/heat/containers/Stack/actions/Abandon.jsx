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
import { ConfirmAction } from 'containers/Action';
import globalStackStore from 'stores/heat/stack';

export default class Abandon extends ConfirmAction {
  get id() {
    return 'abandon';
  }

  get title() {
    return t('Abandon Stack');
  }

  get actionName() {
    return t('abandon stack');
  }

  get isDanger() {
    return true;
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'stacks:abandon';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return true;
  };

  confirmContext = (data) => {
    const name = this.getName(data);
    return (
      <div>
        <p>
          {this.unescape(
            t('Are you sure to {action} (instance: {name})?', {
              action: this.actionNameDisplay || this.title,
              name,
            })
          )}
        </p>
        <p>
          {t(
            'Abandoning this stack will preserve the resources deployed by the stack.'
          )}
        </p>
      </div>
    );
  };

  onSubmit = (item) => {
    const { id, name } = item || this.item;
    return globalStackStore.abandon({ id, name });
  };
}
