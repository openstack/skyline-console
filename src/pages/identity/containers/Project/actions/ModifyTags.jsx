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
import globalTagStore from 'stores/keystone/tag';
import { isEqual } from 'lodash';

export class ModifyTags extends ModalAction {
  static id = 'modify-project-tags';

  static title = t('Modify Project Tags');

  static buttonText = t('Modify Project Tags');

  static policy = 'identity:update_project_tags';

  static allowed = () => Promise.resolve(true);

  get name() {
    return t('modify project tags');
  }

  init() {
    this.state = {
      // tags: ,
      tags: this.props.item.tags,
    };
  }

  onSubmit = (values) =>
    globalTagStore.update({ project_id: this.props.item.id }, values);

  get formItems() {
    const { tags } = this.state;
    return [
      {
        name: 'tags',
        label: t('Tags'),
        component: <Tags tags={tags} />,
        validator: (rule, val) => {
          const initialTags = this.props.item.tags || [];

          // for init modal
          if (isEqual(val, initialTags)) {
            return Promise.resolve(true);
          }

          let errorTag = '';
          // check includes / or ,
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
          // case detection: case independent
          if (initialTags.some(checkEqual)) {
            return Promise.reject(
              new Error(t('Duplicate tag name: {tag}', { tag: errorTag }))
            );
          }
          return Promise.resolve(true);

          function checkEqual(tag) {
            return val.some((v) => {
              // It is case insensitive when compared to other values
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
            <div>1. {t('Tags are not case sensitive')}</div>
            <div>
              2. {t('Forward Slash ‘/’ is not allowed to be in a tag name')}
            </div>
            <div>
              3.{' '}
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
