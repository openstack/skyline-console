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

import yaml from 'js-yaml';
import { has, isEmpty, isObject } from 'lodash';
import { yesNoOptions } from 'utils/constants';

export const stackStatus = {
  INIT_IN_PROGRESS: t('Init In Progress'),
  INIT_COMPLETE: t('Init Complete'),
  INIT_FAILED: t('Init Failed'),
  CREATE_IN_PROGRESS: t('Create In Progress'),
  CREATE_COMPLETE: t('Create Complete'),
  CREATE_FAILED: t('Create Failed'),
  DELETE_IN_PROGRESS: t('Delete In Progress'),
  DELETE_COMPLETE: t('Delete Complete'),
  DELETE_FAILED: t('Delete Failed'),
  UPDATE_IN_PROGRESS: t('Update In Progress'),
  UPDATE_COMPLETE: t('Update Complete'),
  UPDATE_FAILED: t('Update Failed'),
  ROLLBACK_IN_PROGRESS: t('Rollback In Progress'),
  ROLLBACK_COMPLETE: t('Rollback Complete'),
  ROLLBACK_FAILED: t('Rollback Failed'),
  SUSPEND_IN_PROGRESS: t('Suspend In Progress'),
  SUSPEND_COMPLETE: t('Suspend Complete'),
  SUSPEND_FAILED: t('Suspend Failed'),
  RESUME_IN_PROGRESS: t('Resume In Progress'),
  RESUME_COMPLETE: t('Resume Complete'),
  RESUME_FAILED: t('Resume Failed'),
  ADOPT_IN_PROGRESS: t('Adopt In Progress'),
  ADOPT_COMPLETE: t('Adopt Complete'),
  ADOPT_FAILED: t('Adopt Failed'),
  SNAPSHOT_IN_PROGRESS: t('Snapshot In Progress'),
  SNAPSHOT_COMPLETE: t('Snapshot Complete'),
  SNAPSHOT_FAILED: t('Snapshot Failed'),
  CHECK_IN_PROGRESS: t('Check In Progress'),
  CHECK_COMPLETE: t('Check Complete'),
  CHECK_FAILED: t('Check Failed'),
};

export const validateYaml = (rule, value) => {
  try {
    yaml.load(value);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return Promise.reject(
      t(
        'A template is a YAML file that contains configuration information, please enter the correct format.'
      )
    );
  }
  return Promise.resolve();
};

export const getYaml = (value) => {
  try {
    const content = yaml.load(value, { schema: yaml.JSON_SCHEMA });
    return content;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return null;
  }
};

export const yamlTip = t(
  'A template is a YAML file that contains configuration information.'
);

export const paramTip = t(
  'When your Yaml file is a fixed template, variable variables can be stored in an environment variable file to implement template deployment. The parameters in the environment variable file need to match the parameters defined in the template file.'
);

export const rollbackTip = t(
  'If "Enable" fails to roll back, the resource will be deleted after the creation fails; if "Disable" fails to roll back, the resource will be retained after the creation fails.'
);

export const getTemplate = (context = {}) => {
  const { content } = context;
  return content;
};

export const getFormItemType = (type) => {
  switch (type) {
    case 'number':
      return {
        type: 'input-number',
      };
    case 'json':
      return {
        type: 'input-json',
      };
    case 'boolean':
      return {
        type: 'radio',
        options: yesNoOptions,
      };
    default:
      return {
        type: 'input',
      };
  }
};

export const getParamsFromContent = (contentYaml) => {
  try {
    const content = yaml.load(contentYaml);
    if (!isObject(content)) {
      return {};
    }
    const params = content.parameters;
    return params || {};
  } catch {
    return {};
  }
};

export const getFormItems = (contentYaml) => {
  const formItems = [];
  try {
    const params = getParamsFromContent(contentYaml);
    if (isEmpty(params)) {
      return formItems;
    }
    Object.keys(params).forEach((key) => {
      const value = params[key];
      const { type = 'string', description = '', label, hidden } = value;
      const typeProp = getFormItemType(type);
      const item = {
        name: key,
        label: label || key,
        extra: description,
        required: true,
        hidden,
        ...typeProp,
      };
      formItems.push(item);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  return formItems;
};

export const getFormDefaultValues = (contentYaml) => {
  const values = {};
  try {
    const content = yaml.load(contentYaml);
    if (!isObject(content)) {
      return values;
    }
    const params = content.parameters || {};
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (has(value, 'default')) {
        values[key] = value.default;
      } else if (value.type === 'boolean') {
        values[key] = false;
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  return values;
};
