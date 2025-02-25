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
import { Skeleton } from 'antd';
import { generateId } from 'utils/index';
import styles from './index.less';

const Infos = ({ title, descriptions, loading }) => {
  const descItems = (
    <div className={styles['items-container']}>
      {descriptions.map((item) => {
        if (typeof item.content === 'number') {
          item.content = item.content.toString();
        }
        return (
          <div key={`label-${generateId()}`} className={styles.item}>
            <div className={styles.label}>{item.label}</div>
            <div className={styles.content}>{item.content}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Skeleton loading={loading}>
      {title}
      {descItems}
    </Skeleton>
  );
};

const detailProps = PropTypes.shape({
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.any,
});

Infos.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  descriptions: PropTypes.arrayOf(detailProps),
  loading: PropTypes.bool,
};

export default Infos;
