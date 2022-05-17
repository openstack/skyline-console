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
import { FormAction } from 'containers/Action';
import globalDomainStore from 'stores/keystone/domain';

export class EditForm extends FormAction {
  init() {
    this.store = globalDomainStore;
  }

  componentDidMount() {
    const { item } = this.props;
    const {
      params: { id },
    } = this.props.match;
    this.store.fetchDetail({ ...item, id });
  }

  static id = 'domain-edit';

  static title = t('Edit Domain');

  static path(item) {
    return `/identity/domain-admin/edit/${item.id}`;
  }

  static policy = 'identity:update_domain';

  static allowed() {
    return Promise.resolve(true);
  }

  get listUrl() {
    return this.getRoutePath('domain');
  }

  get data() {
    return this.store.detail || [];
  }

  get name() {
    const { name } = this.data;
    return `${t('edit domain')} ${name}`;
  }

  get labelCol() {
    return {
      xs: { span: 6 },
      sm: { span: 5 },
    };
  }

  get domainUserList() {
    return (this.store.domainUsers || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get defaultValue() {
    const { name, description, domain_administrator } = this.store.detail;
    const userIds = [];
    (domain_administrator || []).map((it) => userIds.push(it.id));
    if (name && this.formRef.current) {
      this.formRef.current.setFieldsValue({
        name,
        description,
        adminUsers: userIds,
      });
    }
    return {};
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        placeholder: t('Please input name'),
        // required: true,
        help: t('The name cannot be modified after creation'),
        disabled: true,
      },
      {
        name: 'adminUsers',
        label: t('Domain Manager'),
        type: 'select',
        mode: 'multiple',
        options: this.domainUserList,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = async (values) => {
    const { description, adminUsers } = values;
    const {
      adminRoleId: role_id,
      detail: { domain_administrator: oldUsers },
    } = this.store;
    const {
      params: { id },
    } = this.props.match;
    const promiseList = [];
    oldUsers.forEach((user) => {
      const { id: user_id } = user;
      if (adminUsers.indexOf(user_id) === -1) {
        promiseList.push(
          globalDomainStore.deleteDomainAdmin({ id, user_id, role_id })
        );
      }
    });
    adminUsers.forEach((user_id) =>
      promiseList.push(
        globalDomainStore.setDomainAdmin({ id, user_id, role_id })
      )
    );
    promiseList.push(globalDomainStore.edit({ id, description }));
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(EditForm));
