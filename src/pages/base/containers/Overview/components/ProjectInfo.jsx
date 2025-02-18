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

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import CubeCard from '../../../../../components/cube/CubeCard';
import styles from '../style.less';

export class ProjectInfo extends Component {
  get rootStore() {
    return this.props.rootStore || {};
  }

  get currentUser() {
    const { user: { user } = {} } = this.rootStore;
    return user || {};
  }

  get roles() {
    const { roles = [] } = this.rootStore;
    return roles;
  }

  renderAccount() {
    return (
      <div className={styles['project-column']}>
        <div className={styles['column-label']}>{t('User Account')}</div>
        <div className={styles['column-text']}>{this.currentUser.name}</div>
      </div>
    );
  }

  renderRoles() {
    return (
      <div className={styles['project-column']}>
        <div className={styles['column-label']}>{t('My Role')}</div>
        <div className={styles['column-text']}>
          {this.roles.map((item) => item.name).join(', ')}
        </div>
      </div>
    );
  }

  renderDomain() {
    return (
      <div className={styles['project-column']}>
        <div className={styles['column-label']}>{t('Affiliated Domain')}</div>
        <div className={styles['column-text']}>
          {this.currentUser.domain.name}
        </div>
      </div>
    );
  }

  render() {
    if (!this.currentUser.name) {
      return null;
    }
    return (
      <CubeCard title={t('Hello, {name}', { name: this.currentUser.name })}>
        <div className={styles.project}>
          {this.renderAccount()}
          {this.renderRoles()}
          {this.renderDomain()}
        </div>
      </CubeCard>
    );
  }
}

export default inject('rootStore')(observer(ProjectInfo));
