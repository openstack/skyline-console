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
import Avatar from './AvatarDropdown';
import styles from './index.less';

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
  const { isAdminPage = false, rootStore: { hasAdminRole = false } = {} } =
    props;
  let linkRender = null;
  if (isAdminPage) {
    linkRender = (
      <Button
        type="link"
        onClick={() => gotoConsole(0, props)}
        className={styles['single-link']}
      >
        {t('Console')}
      </Button>
    );
  } else if (hasAdminRole) {
    linkRender = (
      <Button
        type="link"
        onClick={() => gotoConsole(1, props)}
        to="/base/overview-admin"
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

// import React from 'react';
// import Avatar from './AvatarDropdown';
// import { Divider } from 'antd';
// import styles from './index.less';
// import Message from './Message';
// import { Link } from 'react-router-dom';

// const GlobalHeaderRight = (props) => {
//   const { isAdminPage = false, rootStore: { hasAdminRole = false } = {} } = props;
//   let linkRender = null;
//   if (hasAdminRole) {
//     const consoleLink = isAdminPage ?
//       <Link to="/base/overview" className={styles.link}>{ t('Console') }</Link> :
//       <span className={styles.active}>{t('Console')}</span>;
//     const adminLink = !isAdminPage ?
//       <Link to="/base/overview-admin" className={styles.link}>{ t('Administrator') }</Link> :
//       <span className={styles.active}>{t('Administrator')}</span>;
//     linkRender = <div className={styles.links}>
//       { consoleLink }
//       <Divider type="vertical" />
//       { adminLink }
//     </div>;
//   }

//   return <div className={styles.right}>
//     {linkRender}
//     <Message />
//     <Avatar menu />
//   </div>;
// };

// export default GlobalHeaderRight;
