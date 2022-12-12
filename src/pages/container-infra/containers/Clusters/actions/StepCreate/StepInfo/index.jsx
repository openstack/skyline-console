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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import globalClusterTemplateStore from 'stores/magnum/clusterTemplates';
import { getBaseTemplateColumns } from 'resources/magnum/template';

export class StepInfo extends Base {
  init() {
    this.getClustertemplates();
  }

  get title() {
    return t('Info');
  }

  get name() {
    return t('Info');
  }

  async getClustertemplates() {
    await globalClusterTemplateStore.fetchList();
    this.updateDefaultValue();
  }

  get clusterTemplates() {
    const templates = globalClusterTemplateStore.list.data || [];
    const { template } = this.locationParams;
    if (template) {
      return templates.filter((it) => it.uuid === template);
    }
    return templates;
  }

  get defaultValue() {
    const values = {};

    const { template } = this.locationParams;
    if (template) {
      values.clusterTemplate = {
        selectedRowKeys: [template],
        selectedRows: this.clusterTemplates,
      };
    }

    return values;
  }

  clusterNameValidator = (rule, value) => {
    const pattern = /^[a-zA-Z][a-zA-Z0-9_.-]*$/;
    if (!value) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('');
    }
    if (!pattern.test(value)) {
      return Promise.reject(
        t(
          'The name should start with upper letter or lower letter, characters can only contain "0-9, a-z, A-Z, -, _, ."'
        )
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Cluster Name'),
        type: 'input',
        placeholder: t('Please input cluster name'),
        required: true,
        validator: this.clusterNameValidator,
      },
      {
        name: 'clusterTemplate',
        label: t('Cluster Template'),
        type: 'select-table',
        data: this.clusterTemplates,
        isLoading: globalClusterTemplateStore.list.isLoading,
        required: true,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getBaseTemplateColumns(this),
        onChange: (value) => {
          this.updateContext({
            clusterTemplate: value,
          });
        },
      },
    ];
  }
}

export default inject('rootStore')(observer(StepInfo));
