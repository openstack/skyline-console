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
import { Button, Col, Row } from 'antd';
import { isUserCenterPage } from 'utils';
import Avatar from './AvatarDropdown';
import styles from './index.less';

// eslint-disable-next-line no-unused-vars
const gotoConsole = (type, props) => {
  const { rootStore } = props;
  rootStore.clearData();
  if (type === 0) {
    rootStore.routing.push('/base/overview');
  } else {
    rootStore.routing.push('/base/overview-admin');
  }
};

const GlobalHeaderRight = (props) => {
  const {
    isAdminPage = false,
    rootStore: { hasAdminPageRole = false } = {},
    location: { pathname },
  } = props;
  let linkRender = null;
  if (isAdminPage || isUserCenterPage(pathname)) {
    linkRender = (
      <Button
        type="link"
        href="/base/overview"
        className={styles['single-link']}
      >
        {t('Console')}
      </Button>
    );
  } else if (hasAdminPageRole) {
    linkRender = (
      <Button
        type="link"
        href="/base/overview-admin"
        className={styles['single-link']}
      >
        {t('Administrator')}
      </Button>
    );
  }

  return (
    <div className={styles.right}>
      <Row
        justify="space-between"
        align="middle"
        gutter={10}
        // wrap={false}
      >
        <Col>{linkRender}</Col>
        <Col>
          <Avatar menu />
        </Col>
      </Row>
    </div>
  );
};

export default GlobalHeaderRight;
