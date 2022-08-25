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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalShareAccessRuleStore from 'stores/manila/share-access-rule';
import { shareAccessRuleState, shareAccessLevel } from 'resources/manila/share';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

export class ShareAccessRule extends Base {
  init() {
    this.store = globalShareAccessRuleStore;
  }

  get policy() {
    return 'share_access_rule:index';
  }

  get name() {
    return t('share access rules');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigsAdmin;
    }
    const { detail: { isMine } = {} } = this.props;
    if (isMine) {
      return actionConfigs.actionConfigs;
    }
    return emptyActionConfig;
  }

  getColumns = () => [
    {
      title: t('ID'),
      dataIndex: 'id',
    },
    {
      title: t('Access Type'),
      dataIndex: 'access_type',
    },
    {
      title: t('Access To'),
      dataIndex: 'access_to',
    },
    {
      title: t('Access Level'),
      dataIndex: 'access_level',
      valueMap: shareAccessLevel,
    },
    {
      title: t('State'),
      dataIndex: 'state',
      valueMap: shareAccessRuleState,
    },
    {
      title: t('Access Key'),
      dataIndex: 'access_key',
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      valueRender: 'toLocalTime',
      isHideable: true,
    },
    {
      title: t('Updated At'),
      dataIndex: 'updated_at',
      valueRender: 'toLocalTime',
      isHideable: true,
    },
  ];
}

export default inject('rootStore')(observer(ShareAccessRule));
