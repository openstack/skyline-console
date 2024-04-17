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
import Base from 'components/Form';
import {
  getFormItems,
  getYaml,
  getFormDefaultValues,
  getTemplate,
  rollbackTip,
  getParamsFromContent,
} from 'resources/heat/stack';
import { getValue } from 'utils/yaml';

export class Parameter extends Base {
  get isStep() {
    return true;
  }

  get title() {
    return t('Parameter');
  }

  get name() {
    return t('Parameter');
  }

  get defaultValue() {
    const values = {
      rollback: true,
      timeout_mins: 60,
      ...this.defaultParams,
    };
    if (this.isEdit) {
      values.stack_name = this.props.extra.stack_name;
      values.rollback = !this.props.extra.disable_rollback;
    }
    return values;
  }

  get isEdit() {
    return !!this.props.extra;
  }

  get template() {
    return getTemplate(this.props.context || {});
  }

  get defaultParams() {
    const { params = '' } = this.props.context || {};
    const defaultValues = getFormDefaultValues(this.template);
    const inputValues = getYaml(params) || {};
    const paramsValues = inputValues.parameters || inputValues;
    return {
      ...defaultValues,
      ...paramsValues,
    };
  }

  get templateFormItems() {
    return getFormItems(this.template);
  }

  updateParamsInContext = (key, value) => {
    const { params = '' } = this.props.context || {};
    const newParams = !params ? { parameters: {} } : getYaml(params);
    newParams.parameters[key] = value;
    this.updateContext({ params: getValue(newParams) });
  };

  onValuesChange = (changedFields) => {
    const params = getParamsFromContent(this.template);
    const keys = Object.keys(params);
    Object.keys(changedFields).forEach((key) => {
      if (keys.includes(key)) {
        this.updateParamsInContext(key, changedFields[key]);
      }
    });
  };

  get rollbackOptions() {
    return [
      { value: true, label: t('Enable') },
      { value: false, label: t('Disable') },
    ];
  }

  get formItems() {
    const items = this.templateFormItems;
    const nameItemEdit = {
      name: 'name',
      label: t('Stack Name'),
      type: 'label',
    };
    const nameItemCreate = {
      name: 'name',
      label: t('Stack Name'),
      type: 'input-name',
      required: true,
      isStack: true,
    };
    const formItems = [
      {
        name: 'timeout_mins',
        label: t('Creation Timeout (Minutes)'),
        type: 'input-int',
        required: true,
      },
      {
        name: 'rollback',
        label: t('Fail Rollback'),
        type: 'radio',
        required: true,
        tip: rollbackTip,
        options: this.rollbackOptions,
      },
      {
        label: t('Fill In The Parameters'),
        type: 'title',
      },
      ...items,
    ];
    if (this.isEdit) {
      formItems.unshift(nameItemEdit);
    } else {
      formItems.unshift(nameItemCreate);
    }
    return formItems;
  }
}

export default inject('rootStore')(observer(Parameter));
