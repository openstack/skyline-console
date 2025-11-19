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
import { ModalAction } from 'containers/Action';
import { allCanReadPolicy } from 'resources/skyline/policy';
import globalUserStore from 'stores/keystone/user';
import { SimpleTag } from 'resources/nova/instance';

export class ProjectSelect extends ModalAction {
  static id = 'project-id';

  static title = t('Switch Project');

  static buttonText = ' ';

  init() {
    this.getAllUserProjects();
  }

  async getAllUserProjects() {
    await globalUserStore.getUserProjects();
    this.updateDefaultValue();
  }

  get name() {
    return t('Switch Project');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get messageHasItemName() {
    return false;
  }

  static policy = allCanReadPolicy;

  static allowed = () => Promise.resolve(true);

  state = {
    projectName: '',
  };

  get user() {
    const { user } = this.props.rootStore;
    return user;
  }

  get project() {
    const {
      project: {
        id: projectId = '',
        name: projectName = '',
        domain: { name: userDomainName } = {},
      } = {},
    } = this.user || {};
    return {
      projectId,
      projectName,
      userDomainName,
    };
  }

  get projects() {
    const { projectName } = this.state;
    const { data: projects } = globalUserStore.userProjects;
    const items = projects
      .map((project) => {
        const { id, ...rest } = project;
        return {
          id,
          projectId: id,
          ...rest,
        };
      })
      .filter((it) => {
        if (!projectName) {
          return true;
        }
        return (
          it.name.toLowerCase().indexOf(projectName.toLowerCase()) >= 0 ||
          it.projectId.toLowerCase().indexOf(projectName.toLowerCase()) >= 0
        );
      });
    return items;
  }

  get defaultValue() {
    const { projectId = '' } = this.project;
    return {
      project: {
        selectedRowKeys: [projectId],
        selectedRows: this.projects.filter((i) => i.id === projectId),
      },
    };
  }

  get formItems() {
    return [
      {
        name: 'project',
        label: t('Owned Project'),
        type: 'select-table',
        data: this.projects,
        isLoading: globalUserStore.userProjects.isLoading,
        disabledFunc: (record) => !record.enabled,
        filterParams: [
          {
            label: t('Project Name'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Project Name'),
            dataIndex: 'name',
          },
          {
            title: t('ID'),
            dataIndex: 'id',
          },
          {
            title: t('Description'),
            dataIndex: 'description',
          },
          {
            title: t('Tags'),
            dataIndex: 'tags',
            render: (tags) => {
              if (!tags || !Array.isArray(tags) || tags.length === 0) {
                return '-';
              }
              return tags.map((tag, index) => SimpleTag({ tag, index }));
            },
          },
          {
            title: t('Enabled'),
            dataIndex: 'enabled',
            valueRender: 'yesNo',
          },
        ],
      },
    ];
  }

  onSubmit = async (values) => {
    const {
      project: { selectedRowKeys },
    } = values;
    const key = selectedRowKeys[0];
    const item = this.projects.find((it) => it.id === key);
    const { domain_id: domainId } = item || {};
    const { rootStore } = this.props;
    try {
      await rootStore.switchProject(key, domainId);
      this.routing.push('/base/overview');
      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  };
}

export default inject('rootStore')(observer(ProjectSelect));
