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
import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import Tags from 'components/Tags';
import globalTagStore from 'stores/nova/tag';
import { isEqual } from 'lodash';

export class ModifyTags extends ModalAction {
  static id = 'modify-instance-tags';

  static title = t('Modify Instance Tags');

  static buttonText = t('Modify Instance Tags');

  static policy = 'os_compute_api:os-server-tags:update_all';

  static allowed = () => Promise.resolve(true);

  get name() {
    return t('modify instance tags');
  }

  init() {
    this.state.tags = this.props.item.tags || [];
  }

  onSubmit = (values) => {
    return globalTagStore.update({ serverId: this.props.item.id }, values);
  };

  get formItems() {
    const { tags } = this.state;
    return [
      {
        name: 'tags',
        label: t('Tags'),
        component: <Tags tags={tags} maxLength={60} maxCount={50} />,
        validator: (rule, val) => {
          const initialTags = this.props.item.tags || [];

          // for init modal
          if (isEqual(val, initialTags)) {
            return Promise.resolve(true);
          }

          let errorTag = '';
          // 检测是否包含 / 和 ，
          if (
            val.some((tag) => {
              const ret = tag.includes('/') || tag.includes(',');
              ret && (errorTag = tag);
              return ret;
            })
          ) {
            return Promise.reject(
              new Error(t('Invalid Tag Value: {tag}', { tag: errorTag }))
            );
          }
          // 检测大小写
          if (initialTags.some(checkEqual)) {
            return Promise.reject(
              new Error(t('Duplicate tag name: {tag}', { tag: errorTag }))
            );
          }
          return Promise.resolve(true);

          function checkEqual(tag) {
            return val.some((v) => {
              // 不是原始值，并且新值大小写不敏感
              const flag = tag !== v && v.toLowerCase() === tag.toLowerCase();
              if (flag) {
                errorTag = v;
              }
              return flag;
            });
          }
        },
        extra: (
          <div>
            <div>1. {t('Each server can have up to 50 tags')}</div>
            <div>2. {t('Tags are not case sensitive')}</div>
            <div>3. {t('Tag is no longer than 60 characters')}</div>
            <div>
              4. {t('Forward Slash ‘/’ is not allowed to be in a tag name')}
            </div>
            <div>
              5.{' '}
              {t(
                'Commas ‘,’ are not allowed to be in a tag name in order to simplify requests that specify lists of tags'
              )}
            </div>
          </div>
        ),
      },
    ];
  }
}

export default inject('rootStore')(observer(ModifyTags));
