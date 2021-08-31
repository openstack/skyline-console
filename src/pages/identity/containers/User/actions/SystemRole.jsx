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
import { Select } from 'antd';
import globalProjectStore from 'stores/keystone/project';
import globalUserStore from 'stores/keystone/user';
import globalRoleStore from 'stores/keystone/role';
import { ModalAction } from 'containers/Action';
import globalDomainStore from 'stores/keystone/domain';

export class SystemRole extends ModalAction {
  constructor(props) {
    super(props);
    const systemRole = JSON.stringify(this.item.projectMapSystemRole);
    this.state = {
      domainDefault: this.item.domain_id,
      projectRoles: JSON.parse(systemRole),
      projectList: [],
    };
  }

  // componentDidMount() {
  //   this.setState({ projectRoles: this.defaultSystemRoles });
  // }

  static id = 'edit-system-permission';

  static title = t('Edit System Permission');

  get name() {
    return t('edit system permission');
  }

  init() {
    this.store = globalRoleStore;
    this.domainStore = globalDomainStore;
    this.userStore = globalUserStore;
    this.getRoleList();
    this.getDomains();
    this.getUser();
  }

  getRoleList() {
    this.store.fetchList();
  }

  getDomains() {
    this.domainStore.fetchDomain();
  }

  getUser() {
    this.userStore.fetchProject();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  // get defaultSystemRoles() {
  //   const { projects } = this.item;
  //   const defaultProjects = Object.keys(projects);
  //   const systemRole = (this.store.list.data || []).filter(it =>
  //     ((it.name.indexOf('system_') !== -1) && (it.name.indexOf('_system_') === -1)) ||
  //     it.name === 'admin'
  //   );
  //   const systemRoleId = systemRole.map(it => it.id);
  //   const defaultSystemRoles = {};
  //   defaultProjects.forEach((project_id) => {
  //     const roles = projects[project_id].filter(role_id => systemRoleId.indexOf(role_id) !== -1);
  //     if (roles[0]) {
  //       defaultSystemRoles[project_id] = roles;
  //     }
  //   });
  //   return defaultSystemRoles;
  // }

  get domainList() {
    const {
      rootStore: { baseDomains },
    } = this.props;
    const { domains } = this.domainStore;
    const domainList = (domains || []).filter(
      (it) =>
        baseDomains.indexOf(it.name) === -1 || it.id === this.item.domain_id
    );
    return domainList.map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get item() {
    const { item } = this.props;
    item.roles = {};
    return item;
  }

  get projectList() {
    return (this.userStore.projects || []).map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  get systemRoleList() {
    const systemRole = this.store.list.data || [];
    return systemRole;
  }

  get adminRoleId() {
    const adminRole = (this.store.list.data || []).filter(
      (it) => it.name === 'admin'
    );
    return adminRole[0].id;
  }

  adminRoleList = (project_id) => {
    const adminRole = (this.store.list.data || []).filter(
      (it) => it.name === 'admin'
    );
    return adminRole.map((it) => ({
      label: it.name,
      value: it.id,
      project_id,
    }));
  };

  projectRolesList = (project_id) =>
    this.systemRoleList.map((it) => ({
      label: it.name,
      value: it.id,
      project_id,
    }));

  defaultRoles = (projectId) => {
    const { roles } = this.item;
    const { projectRoles: users } = this.state;
    if (!users[projectId]) {
      roles[projectId] = [this.systemRoleList[0].id];
    } else {
      const userssystemRole = users[projectId].filter((it) => {
        const systemRole = this.systemRoleList.filter((role) => role.id === it);
        if (systemRole[0]) {
          return true;
        }
        return false;
      });
      return userssystemRole;
    }
    return roles[projectId];
  };

  static policy = 'identity:update_project';

  static allowed = () => Promise.resolve(true);

  get leftUserTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
    ];
  }

  get rightUserTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
      {
        title: t('Select System Role'),
        dataIndex: 'id',
        render: (id) => this.renderSelect(id),
      },
    ];
  }

  renderSelect = (id) => {
    let disable = false;
    if (this.item.projects && this.item.projects[id]) {
      // eslint-disable-next-line prefer-destructuring
      disable = this.item.projects[id].filter(
        (it) => it === this.adminRoleId
      )[0];
    }
    return (
      <Select
        size="small"
        options={disable ? this.adminRoleList(id) : this.projectRolesList(id)}
        defaultValue={disable ? this.adminRoleId : this.defaultRoles(id)}
        onChange={this.onSubChange}
        disabled={disable}
      />
    );
  };

  onSubChange = (value, option) => {
    const { projectRoles } = this.state;
    const { project_id } = option;
    projectRoles[project_id] = [value];
    this.setState({ projectRoles });
  };

  get checkedList() {
    const { domains } = this.domainStore;
    return (domains || []).map((it) => ({
      label: it.name,
      value: it.id,
    }));
  }

  get defaultValue() {
    const { domain_id: domain } = this.item;
    const data = {
      domain_id: domain || 'default',
    };
    return data;
  }

  get formItems() {
    // const { users } = this.item;
    const { domainDefault, projectRoles } = this.state;
    return [
      {
        name: 'domain_id',
        label: t('Affiliated Domain'),
        type: 'select',
        checkOptions: this.checkedList,
        checkBoxInfo: t('Show All Domain'),
        options: this.domainList,
        onChange: (e) => {
          this.setState({
            domainDefault: e,
          });
        },
        required: true,
      },
      {
        name: 'select_project',
        type: 'transfer',
        label: t('Project'),
        leftTableColumns: this.leftUserTable,
        rightTableColumns: this.rightUserTable,
        dataSource: this.projectList
          ? this.projectList.filter((it) => it.domain_id === domainDefault)
          : [],
        disabled: false,
        showSearch: true,
        oriTargetKeys: projectRoles ? Object.keys(projectRoles) : [],
      },
    ];
  }

  onSubmit = async (values) => {
    const { projectRoles } = this.state;
    const { id: user_id } = this.item;
    const oldProjectRoles = this.item.projectMapSystemRole;
    const defaultProjects = Object.keys(oldProjectRoles);
    const promiseList = [];
    defaultProjects.forEach((id) => {
      if (values.select_project.indexOf(id) === -1) {
        (oldProjectRoles[id] || []).forEach((role_id) => {
          promiseList.push(
            globalProjectStore.removeUserRole({ id, user_id, role_id })
          );
        });
      } else {
        (oldProjectRoles[id] || []).forEach((role_id) => {
          if (projectRoles[id].indexOf(role_id) === -1) {
            promiseList.push(
              globalProjectStore.removeUserRole({ id, user_id, role_id })
            );
          }
        });
      }
    });
    values.select_project.forEach((id) => {
      if (defaultProjects.indexOf(id) === -1) {
        const role_id =
          (projectRoles[id] || [])[0] || this.systemRoleList[0].id;
        promiseList.push(
          globalProjectStore.assignUserRole({ id, user_id, role_id })
        );
      } else {
        const role_id = projectRoles[id][0];
        if (
          (oldProjectRoles[id] && oldProjectRoles[id][0] !== role_id) ||
          !oldProjectRoles[id]
        ) {
          promiseList.push(
            globalProjectStore.assignUserRole({ id, user_id, role_id })
          );
        }
      }
    });
    const results = await Promise.all(promiseList);
    return results;
  };
}

export default inject('rootStore')(observer(SystemRole));
