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

import { observer } from 'mobx-react';
import Base from 'containers/List';

@observer
export default class TabTable extends Base {
  componentDidMount() {}

  getData() {}

  getDataSource = () => {
    return this.list.data;
  };

  get params() {
    return {};
  }

  get list() {
    return {
      data: this.props.store.data.filter(
        (d) => d.type === (this.props.store.device || 'pool')
      ),
      filters: [],
    };
  }

  get location() {
    return {
      search: [],
    };
  }

  get rowKey() {
    const { tabKey } = this.store;
    return tabKey === 'pools' ? 'pool_id' : 'ceph_daemon';
  }

  get name() {
    return t('tab tables');
  }

  get actionConfigs() {
    return {
      rowActions: {},
      primaryActions: [],
    };
  }

  getColumns = () => {
    const { columns } = this.props;
    return columns || [];
  };

  get searchFilters() {
    const { searchFilters } = this.props;
    return searchFilters || [];
  }
}
