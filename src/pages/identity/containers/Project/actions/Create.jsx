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
import Notify from 'components/Notify';
import globalDomainStore from 'stores/keystone/domain';
import globalProjectStore from 'stores/keystone/project';
import globalTagStore from 'stores/keystone/tag';
import { regex } from 'utils/validate';
import { statusTypes, getDomainFormItem } from 'resources/keystone/domain';

export class Create extends ModalAction {
  constructor(props) {
    super(props);
    this.state = {
      domain: null,
      newUserRoles: {},
      newGroupRoles: {},
      tags: [],
    };
  }

  init() {
    this.domainStore = globalDomainStore;
    this.projectStore = globalProjectStore;
    this.getDomains();
  }

  getDomains() {
    this.domainStore.fetchDomain();
  }

  static id = 'project-create';

  static title = t('Create Project');

  static policy = [
    'identity:create_project',
    'identity:update_project_tags',
    'identity:list_domains',
    'identity:list_roles',
    'identity:list_users',
  ];

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Project');
  }

  get defaultValue() {
    const data = {
      domain_id: 'default',
      enabled: statusTypes[0],
    };
    return data;
  }

  checkName = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please input'));
    }
    const { nameRegexWithoutChinese } = regex;
    if (!nameRegexWithoutChinese.test(value)) {
      return Promise.reject(t('Invalid: Project name can not be chinese'));
    }
    const domainId = this.formRef.current.getFieldValue('domain_id');
    if (!domainId) {
      return Promise.resolve();
    }
    const {
      list: { data },
    } = this.projectStore;
    const nameUsed = data.filter(
      (it) => it.name === value && it.domain_id === domainId
    );
    if (nameUsed[0]) {
      return Promise.reject(
        t('Invalid: Project names in the domain can not be repeated')
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    const domainFormItem = getDomainFormItem(this);
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true,
        placeholder: t('Please input name'),
        validator: this.checkName,
        extra: t('Project') + t('Name can not be duplicated'),
        maxLength: 30,
        dependencies: ['domain_id'],
      },
      domainFormItem,
      {
        name: 'enabled',
        label: t('Status'),
        type: 'radio',
        optionType: 'default',
        options: statusTypes,
        required: true,
        isWrappedValue: true,
        tip: t(
          'Disabling the project will have a negative impact. If the users associated with the project are only assigned to the project, they will not be able to log in'
        ),
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'tags',
        label: t('Tags'),
        component: (
          <Tags
            tags={this.state.tags}
            onChange={(newTags) => {
              this.setState({ tags: newTags });
              // Also update form value
              if (this.formRef.current) {
                this.formRef.current.setFieldsValue({ tags: newTags });
              }
            }}
          />
        ),
        validator: (rule, val) => {
          if (!val || val.length === 0) {
            return Promise.resolve(true);
          }

          // API pattern: ^[^,/]*$ - tags cannot contain comma or forward slash
          const tagPattern = /^[^,/]*$/;
          let errorTag = '';
          if (
            val.some((tag) => {
              const ret = !tagPattern.test(tag);
              ret && (errorTag = tag);
              return ret;
            })
          ) {
            return Promise.reject(
              new Error(t('Invalid Tag Value: {tag}', { tag: errorTag }))
            );
          }

          // check for duplicates
          const uniqueTags = new Set();
          const duplicateTags = [];
          val.forEach((tag) => {
            const lowerTag = tag.toLowerCase();
            if (uniqueTags.has(lowerTag)) {
              duplicateTags.push(tag);
            } else {
              uniqueTags.add(lowerTag);
            }
          });
          if (duplicateTags.length > 0) {
            return Promise.reject(
              new Error(
                t('Duplicate tag name: {tag}', { tag: duplicateTags[0] })
              )
            );
          }
          return Promise.resolve(true);
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

  onSubmit = async (values) => {
    const { tags, ...projectData } = values;
    projectData.enabled = projectData.enabled.value;

    // Create the project first
    const result = await this.projectStore.create(projectData);

    // If tags were provided, add them after project creation
    if (tags && tags.length > 0 && result?.project?.id) {
      try {
        await globalTagStore.update(
          { project_id: result.project.id },
          { tags }
        );
      } catch (error) {
        // Don't fail the entire operation if tag update fails
        Notify.warn(
          t('Project created successfully, but failed to add tags'),
          t('You can modify the tags later using the Modify Tags action.')
        );
      }
    }
    return result;
  };
}

export default inject('rootStore')(observer(Create));
