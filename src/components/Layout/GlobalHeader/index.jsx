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
import { Link } from 'react-router-dom';
import cloudLogo from 'asset/image/cloud-logo.svg';
import cloudLogoWhite from 'asset/image/cloud-logo-white.svg';
import { getPath } from 'utils/route-map';
import classnames from 'classnames';
import GlobalNav from '../GlobalNav';
import ProjectDropdown from './ProjectDropdown';
import RightContent from './RightContent';
import styles from './index.less';

export default function HeaderContent(props) {
  const { isAdminPage = false, navItems = [] } = props;

  const getRouteName = (routeName) =>
    isAdminPage ? `${routeName}Admin` : routeName;

  const getRoutePath = (routeName, params = {}, query = {}) => {
    const realName = getRouteName(routeName);
    return getPath({ key: realName, params, query });
  };

  const renderLogo = () => {
    const homeUrl = getRoutePath('overview');
    const logoSrc =
      GLOBAL_VARIABLES.skylineThemeName === 'default'
        ? cloudLogo
        : cloudLogoWhite;
    return (
      <div className={classnames(styles.logo)}>
        <Link to={homeUrl}>
          <img src={logoSrc} alt="logo" className={styles['logo-image']} />
        </Link>
      </div>
    );
  };

  return (
    <div className={styles.header}>
      <GlobalNav navItems={navItems} />
      {renderLogo()}
      {!isAdminPage && <ProjectDropdown />}
      <RightContent {...props} />
    </div>
  );
}
