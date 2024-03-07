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
import globalVolumeStore from 'stores/cinder/volume';
import { Checkbox, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Volume');
  }

  get name() {
    return t('Delete Volume');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete volume');
  }

  policy = 'volume:delete';

  canDelete = (item) => {
    const { status, attachments = [] } = item;
    const allowedStatus = ['available', 'error', 'error_extending'];
    return allowedStatus.includes(status) && !attachments?.length;
  };

  allowedCheckFunc = (item) => this.canDelete(item);

  onSubmit = (item) => {
    const { id, isCascadeDeleted = true } = item || this.item;
    if (isCascadeDeleted) {
      return globalVolumeStore.cascadeDelete({ id });
    }
    return globalVolumeStore.delete({ id });
  };

  onChangeCascade(choosed, data) {
    if (isArray(data)) {
      data.forEach((it) => {
        it.isCascadeDeleted = choosed;
      });
    } else {
      data.isCascadeDeleted = choosed;
    }
  }

  initCascadeValue = (data) => {
    this.onChangeCascade(true, data);
  };

  renderCascadeDeletion(data) {
    const checkbox = (
      <Checkbox
        defaultChecked
        onChange={(e) => {
          this.onChangeCascade(e.target.checked, data);
        }}
      >
        {t('Cascading deletion')}
      </Checkbox>
    );
    return checkbox;
  }

  get cascadeDeletionTip() {
    return t(
      'Using cascading deletion, when the volume has snapshots, the associated snapshot will be automatically deleted first, and then the volume will be deleted, thereby improving the success rate of deleting the volume.'
    );
  }

  renderCascadeDeletionTip() {
    return (
      <Tooltip title={this.cascadeDeletionTip}>
        <QuestionCircleOutlined />
      </Tooltip>
    );
  }

  confirmContext = (data) => {
    const name = this.getName(data);
    this.initCascadeValue(data);
    return (
      <div>
        <p style={{ marginBottom: '16px' }}>
          {this.unescape(
            t('Are you sure to delete volume { name }? ', { name })
          )}
        </p>
        <div>
          {this.renderCascadeDeletion(data)}
          {this.renderCascadeDeletionTip()}
        </div>
      </div>
    );
  };
}
