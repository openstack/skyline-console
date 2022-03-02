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
import { GlobalOutlined } from '@ant-design/icons';
import styles from './index.less';

const { getLocale, setLocale } = i18n;

const SelectLang = (props) => {
  const { className } = props;
  const selectedLang = getLocale();

  const changeLang = ({ key }) => {
    setLocale(key, false);
  };

  const locales = ['zh-cn', 'en'];
  const languageLabels = {
    'zh-cn': '简体中文',
    en: 'English',
  };
  const languageIcons = {
    'zh-cn': '🇨🇳',
    en: '🇺🇸',
  };
  const langMenu = (
    <Menu
      className={styles.menu}
      selectedKeys={[selectedLang]}
      onClick={changeLang}
    >
      {locales.map((locale) => (
        <Menu.Item key={locale}>
          <span role="img" aria-label={languageLabels[locale]}>
            {languageIcons[locale]}
          </span>{' '}
          {languageLabels[locale]}
        </Menu.Item>
      ))}
    </Menu>
  );
  // return langMenu;
  return (
    <Dropdown overlay={langMenu} placement="bottomRight">
      <span className={classNames(styles['drop-down'], className)}>
        <GlobalOutlined />
      </span>
    </Dropdown>
  );
};

export default SelectLang;
