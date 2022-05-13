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
import { StepAction } from 'containers/Action';
import globalStackStore from 'stores/heat/stack';
import { getYaml } from 'resources/heat/stack';
import { toJS } from 'mobx';
import Parameter from './Parameter';
import Template from './Template';

export class StepCreate extends StepAction {
  static id = 'stack-create';

  static title = t('Create Stack');

  static path = (_, containerProp) => {
    const { isAdminPage } = containerProp;
    return isAdminPage ? '/heat/stack-admin/create' : '/heat/stack/create';
  };

  static policy = 'stacks:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get listUrl() {
    return this.getRoutePath('stack');
  }

  get name() {
    return this.isEdit ? t('update template') : t('create stack');
  }

  get hasConfirmStep() {
    return false;
  }

  get hasExtraProps() {
    return this.isEdit;
  }

  get isEdit() {
    const { pathname } = this.props.location;
    return pathname.indexOf('edit') >= 0;
  }

  get params() {
    const { id, name } = this.props.match.params;
    return { id, name };
  }

  get steps() {
    return [
      {
        title: t('Prepare Template'),
        component: Template,
      },
      {
        title: t('Orchestration information'),
        component: Parameter,
      },
    ];
  }

  init() {
    this.store = globalStackStore;
    this.getDetail();
  }

  async getDetail() {
    if (this.isEdit) {
      const result = await globalStackStore.fetchDetail(this.params);
      this.setState({
        extra: toJS(result),
      });
    }
  }

  onSubmit = (values) => {
    const { params, content, rollback, name, timeout_mins, ...rest } = values;
    const body = {
      stack_name: name,
      disable_rollback: !rollback,
      timeout_mins,
      template: getYaml(content),
      parameters: rest,
    };
    if (this.isEdit) {
      const { stack_name, ...editBody } = body;
      return this.store.edit(this.params, editBody);
    }
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(StepCreate));
