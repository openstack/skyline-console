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

import { Dropdown } from 'antd';
import React from 'react';
import classNames from 'classnames';
// import styles from './index.less';

// const HeaderDropdown = ({ overlayClassName: cls, ...restProps }) => (
//   <Dropdown overlayClassName={classNames(styles.container, cls)} {...restProps} />
// );

const HeaderDropdown = ({ overlayClassName: cls, ...restProps }) => (
  <Dropdown overlayClassName={classNames(cls)} {...restProps} />
);

export default HeaderDropdown;
