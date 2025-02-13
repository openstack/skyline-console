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

import { Menu, Dropdown } from 'antd';
import i18n from 'core/i18n';
import React from 'react';
import classNames from 'classnames';
import networkingIcon from 'asset/cube/monochrome/networking.svg';
import styles from './index.less';

const { getLocale, setLocale, SUPPORT_LOCALES } = i18n;

const SelectLang = (props) => {
  if (SUPPORT_LOCALES.length <= 1) {
    return null;
  }

  const { className } = props;
  const selectedLang = getLocale();

  const changeLang = ({ key }) => {
    setLocale(key, false);
  };

  const locales = SUPPORT_LOCALES.map((it) => it.value);
  const languageLabels = SUPPORT_LOCALES.map((it) => it.name);
  const languageIcons = SUPPORT_LOCALES.map((it) => it.icon);
  const langMenu = (
    <Menu
      className={styles.menu}
      selectedKeys={[selectedLang]}
      onClick={changeLang}
    >
      {locales.map((locale, index) => (
        <Menu.Item key={locale}>
          <span role="img" aria-label={languageLabels[index]}>
            {languageIcons[index]}
          </span>{' '}
          {languageLabels[index]}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={langMenu} placement="bottomRight">
      <span className={classNames(styles['drop-down'], className)}>
        <img src={networkingIcon} alt="language-icon" />
      </span>
    </Dropdown>
  );
};

export default SelectLang;
