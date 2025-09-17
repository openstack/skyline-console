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
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { upperFirst } from 'lodash';
import { Tooltip } from 'antd';
import { osIconMap, osTitleMap } from 'utils/os';
import othersIcon from 'image/others.svg';
import styles from './index.less';

const Index = ({ type, className, title: titleProp }) => {
  const IconComponent = osIconMap[type?.toLowerCase()] || othersIcon;

  const title = osTitleMap[titleProp?.toLowerCase()] || upperFirst(titleProp);

  const iconElement = (
    <IconComponent className={classnames(styles.image, className)} />
  );

  return title ? <Tooltip title={title}>{iconElement}</Tooltip> : iconElement;
};

Index.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
};

Index.defaultProps = {
  type: '',
  className: '',
  title: '',
};

export default Index;
