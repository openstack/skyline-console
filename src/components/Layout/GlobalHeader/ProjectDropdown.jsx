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
import { Spin, Divider, Select, message } from 'antd';
import classnames from 'classnames';
import {
  AppstoreOutlined,
  SwapOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import ItemActionButtons from 'components/Tables/Base/ItemActionButtons';
import styles from './index.less';
import ProjectSelect from './ProjectTable';

const { Option } = Select;

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

  get region() {
    const { region = '', regions = [] } = this.user || {};
    return {
      region,
      regions,
    };
  }

  get isAdminPage() {
    return this.props.isAdminPage || false;
  }

  handleRegionChange = async (value) => {
    const { rootStore } = this.props;
    try {
      await rootStore.switchRegion(value);
      message.success(t(`Switched to region {value} successfully.`, { value }));
    } catch (e) {
      message.error(t('Failed to switch region {value}.', { value }));
      console.error('switchRegion error:', e);
    }
  };

  renderProjectSwitch() {
    if (this.isAdminPage) {
      return null;
    }
    const { projectName, userDomainName } = this.project;
    return (
      <>
        <ItemActionButtons
          actions={{ moreActions: [{ action: ProjectSelect }] }}
        />
        <AppstoreOutlined style={{ marginRight: 10 }} />
        <span>{projectName}</span>
        <SwapOutlined style={{ color: '#A3A3A3', marginLeft: 24 }} />
        <Divider type="vertical" />
        <span className={styles.domain}>{userDomainName}</span>
        <Divider type="vertical" />
      </>
    );
  }

  renderRegionSwitch() {
    const { region, regions } = this.region;
    const hasMultiRegions = regions.length > 1;
    const regionElement = hasMultiRegions ? (
      <Select
        value={region}
        bordered={false}
        style={{
          minWidth: 90,
          color: globalCSS.primaryColor,
          fontSize: '12px',
          fontWeight: 500,
        }}
        dropdownMatchSelectWidth={false}
        onChange={this.handleRegionChange}
        className={styles['region-select']}
        dropdownClassName={styles['region-dropdown']}
      >
        {regions.map((region_name) => (
          <Option key={region_name} value={region_name}>
            {region_name}
          </Option>
        ))}
      </Select>
    ) : (
      <div className={styles['region-item']}>{region}</div>
    );
    return (
      <div
        className={classnames(
          styles['region-container'],
          hasMultiRegions ? styles['has-multi-regions'] : ''
        )}
      >
        <GlobalOutlined style={{ marginRight: 4 }} />
        {regionElement}
      </div>
    );
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
    return (
      <div className={styles.project} id="project-switch">
        {this.renderProjectSwitch()}
        {this.renderRegionSwitch()}
      </div>
    );
  }
}

export default inject('rootStore')(observer(ProjectDropdown));
