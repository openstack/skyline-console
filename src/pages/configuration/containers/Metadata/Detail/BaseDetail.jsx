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
import { inject, observer } from 'mobx-react';
import Base from 'containers/BaseDetail';
import styles from './styles.less';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard, this.resourceCard];
  }

  get rightCards() {
    return [this.jsonCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Namespace'),
        dataIndex: 'namespace',
      },
      {
        label: t('Description'),
        dataIndex: 'description',
      },
    ];
    return {
      title: t('Base Info'),
      options,
    };
  }

  get resourceCard() {
    const { resource_type_associations: resources = [] } =
      this.detailData || {};
    const options = resources.map((item) => {
      const { name, prefix } = item;
      const label = name;
      const content = `${t('Prefix')}: ${prefix || '-'}`;
      return {
        label,
        content,
      };
    });

    return {
      title: t('Associated Resource Types'),
      options,
    };
  }

  get jsonCard() {
    const content = (
      <pre className={styles['json-data']}>
        {JSON.stringify(this.detailData, null, 4)}
      </pre>
    );
    const options = [
      {
        label: '',
        content,
      },
    ];
    return {
      labelCol: 0,
      title: t('Content'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
