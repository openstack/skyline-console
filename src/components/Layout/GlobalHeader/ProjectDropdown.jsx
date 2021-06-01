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
import { toJS } from 'mobx';
import { Menu, Input, Spin, Divider, Dropdown } from 'antd';
import { AppstoreOutlined, SwapOutlined } from '@ant-design/icons';
// import HeaderDropdown from '../HeaderDropdown';
import ItemActionButtons from 'components/Tables/Base/ItemActionButtons';
import styles from './index.less';
import ProjectSelect from './ProjectTable';

@inject('rootStore')
@observer
export default class ProjectDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectName: '',
    };
  }

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
    const { projects = {} } = this.user || {};
    const { projectName } = this.state;
    const items = Object.keys(toJS(projects) || {})
      .map((key) => {
        const { name, domain_id } = projects[key];
        return {
          projectId: key,
          name,
          domain_id,
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

  onClick = async ({ key }) => {
    if (key === 'search' || key === 'title') {
      return;
    }
    const { projectId } = this.project;
    if (key === projectId) {
      return;
    }
    const item = this.projects.find((it) => it.projectId === key);
    const { domain_id: domainId } = item || {};
    const { rootStore } = this.props;
    await rootStore.switchProject(key, domainId);
    // window.location.reload();
  };

  stop = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  onClickInput = (e) => {
    this.stop(e);
  };

  onInputChange = (e) => {
    this.setState({
      projectName: e.target.value,
    });
    this.stop(e);
  };

  render() {
    if (!this.user) {
      return (
        <Spin
          size="small"
          style={{
            marginLeft: 8,
            marginRight: 8,
            marginTop: -24,
          }}
        />
      );
    }
    const { projectId, projectName, userDomainName } = this.project;
    const items = this.projects.map((item) => (
      <Menu.Item key={item.projectId}>
        {item.projectId}: {item.name}
      </Menu.Item>
    ));
    const menuHeaderDropdown = (
      <Menu
        className={styles['project-menu']}
        selectedKeys={[projectId]}
        onClick={this.onClick}
      >
        <Menu.Item key="title" className={styles.title} disabled>
          <span
            style={{
              fontWeight: 'bold',
              marginRight: 8,
              color: 'rgba(0,0,0,0.65)',
            }}
          >
            {t('Projects')}
          </span>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="search" className={styles.search} disabled>
          <Input
            placeholder={t('Filter Project')}
            onClick={this.onClickInput}
            onChange={this.onInputChange}
            allowClear
          />
        </Menu.Item>
        <Menu.Divider />
        {items}
      </Menu>
    );
    // return currentUser && currentUser.name ? menuHeaderDropdown : null;
    return (
      <Dropdown
        overlay={menuHeaderDropdown}
        trigger={['click']}
        visible={false}
      >
        <div className={styles.project} id="project-switch">
          <ItemActionButtons
            actions={{ moreActions: [{ action: ProjectSelect }] }}
          />
          <AppstoreOutlined style={{ marginRight: 10 }} />
          {/* style={{ display: 'inline-block', width: '115px' }} */}
          <span>{projectName}</span>
          <SwapOutlined style={{ color: '#A3A3A3', marginLeft: 24 }} />
          <Divider type="vertical" />
          <span className={styles.domain}>{userDomainName}</span>
        </div>
      </Dropdown>
    );
  }
}
