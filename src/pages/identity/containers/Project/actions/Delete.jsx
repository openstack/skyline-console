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
import globalProjectStore from 'stores/keystone/project';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Project');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete project');
  }

  policy = 'identity:delete_project';

  submitErrorMsg = (data, error) => {
    const name = this.getName(data);
    if (error.status === 400 && error.reason && error.reason.code === 403) {
      if (/^Resource(.*?)exists$/.test(error.reason.message)) {
        return t(
          'There are resources under the project and cannot be deleted.'
        );
      }
    }
    return t('Unable to {action} {name}.', {
      action: this.actionName || this.title,
      name,
    });
  };

  confirmContext = (data) => {
    const name = this.getName(data);
    return (
      <div>
        <div>
          {t('Are you sure to {action} (instance: {name})?', {
            action: this.actionNameDisplay || this.title,
            name,
          })}
        </div>
        <div>
          {t(
            'Before deleting the project, it is recommended to clean up the resources under the project.'
          )}
        </div>
      </div>
    );
  };

  onSubmit = (data) => {
    const { id } = data;
    return globalProjectStore.delete({ id });
  };
}
