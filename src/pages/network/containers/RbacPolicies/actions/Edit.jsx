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
import Notify from 'src/components/Notify';
import { RbacPoliciesStore } from 'src/stores/neutron/rbac-policies';
import { ProjectStore } from 'stores/keystone/project';

export class Edit extends ModalAction {
  static id = 'edit-policy';

  static title = t('Edit');

  get name() {
    return t('Edit');
  }

  init() {
    this.store = new RbacPoliciesStore();
    this.projectStore = new ProjectStore();
    this.getProjects();
  }

  get tips() {
    return t('You may update the editable properties of the RBAC policy here.');
  }

  async getProjects() {
    await this.projectStore.fetchProjectsWithDomain();
    this.setState({ ...this.state, isReady: true });
  }

  get projects() {
    return (this.projectStore.list.data || []).map((it) => ({
      value: it.id,
      label: it.name,
    }));
  }

  onSubmit = async (values) => {
    const { id } = this.item;
    try {
      const { ...body } = values;
      await this.store.update(id, body);
    } catch (error) {
      Notify.errorWithDetail(null, error.toString());
      return Promise.reject(error);
    }
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
        isLoading: this.projectStore.list.isLoading,
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Edit));
