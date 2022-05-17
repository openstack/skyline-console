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
import { Spin, Divider } from 'antd';
import { AppstoreOutlined, SwapOutlined } from '@ant-design/icons';
import ItemActionButtons from 'components/Tables/Base/ItemActionButtons';
import styles from './index.less';
import ProjectSelect from './ProjectTable';

export class ProjectDropdown extends React.Component {
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
    const { projectName, userDomainName } = this.project;
    return (
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
    );
  }
}

export default inject('rootStore')(observer(ProjectDropdown));
