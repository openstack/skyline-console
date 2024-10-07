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
import { ModalAction } from 'containers/Action';
import { RbacPoliciesStore } from 'src/stores/neutron/rbac-policies';
import { ProjectStore } from 'stores/keystone/project';
import { anyProject } from 'src/resources/neutron/rbac-policy';

export class Edit extends ModalAction {
  static id = 'edit-policy';

  static title = t('Edit');

  static policy = 'update_rbac_policy';

  get name() {
    return t('Edit');
  }

  get messageHasItemName() {
    return false;
  }

  init() {
    this.store = new RbacPoliciesStore();
    this.projectStore = new ProjectStore();
    this.state.projects = [];
    this.state.isReady = false;
    this.getProjects();
  }

  get tips() {
    return t('You may update the editable properties of the RBAC policy here.');
  }

  async getProjects() {
    const projects = await this.projectStore.pureFetchList();
    projects.unshift(anyProject);
    this.setState({ projects, isReady: true });
  }

  get projects() {
    const { projects } = this.state;
    return (projects || []).map((it) => ({
      value: it.id,
      label: it.name,
    }));
  }

  get defaultValue() {
    const { target_tenant } = this.item;
    return {
      target_tenant,
    };
  }

  onSubmit = async (values) => {
    const { id } = this.item;
    return this.store.update({ id }, values);
  };

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'target_tenant',
        label: t('Target Project'),
        placeholder: t('Select a project'),
        type: 'select',
        options: this.projects,
        loading: !this.state.isReady,
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Edit));
