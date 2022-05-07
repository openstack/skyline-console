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
import { Button, Col, Row } from 'antd';
import Avatar from './AvatarDropdown';
import styles from './index.less';

export class GlobalHeaderRight extends Component {
  get isAdminPage() {
    const { isAdminPage = false } = this.props;
    return isAdminPage;
  }

  get isUserCenterPage() {
    const { isUserCenterPage = false } = this.props;
    return isUserCenterPage;
  }

  renderConsole() {
    if (this.isAdminPage || this.isUserCenterPage) {
      return (
        <Button
          type="link"
          href="/base/overview"
          className={styles['single-link']}
        >
          {t('Console')}
        </Button>
      );
    }
    return null;
  }

  renderAdministrator() {
    const { rootStore: { hasAdminPageRole = false } = {} } = this.props;
    if (!hasAdminPageRole || this.isAdminPage) {
      return null;
    }
    return (
      <Button
        type="link"
        href="/base/overview-admin"
        className={styles['single-link']}
      >
        {t('Administrator')}
      </Button>
    );
  }

  renderExtra() {
    return null;
  }

  renderExtraLink() {
    return null;
  }

  render() {
    return (
      <div className={styles.right}>
        <Row justify="space-between" align="middle" gutter={10}>
          <Col>
            {this.renderExtraLink()}
            {this.renderConsole()}
            {this.renderAdministrator()}
          </Col>
          {this.renderExtra()}
          <Col>
            <Avatar menu />
          </Col>
        </Row>
      </div>
    );
  }
}

export default inject('rootStore')(observer(GlobalHeaderRight));
