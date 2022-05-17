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
import { SubnetStore } from 'stores/neutron/subnet';
import { toJS } from 'mobx';
import globalRootStore from 'stores/root';
import actionConfigs from './subnetActions';
// import { networkStatus } from 'resources/network';

export class Subnets extends Base {
  init() {
    this.store = new SubnetStore();
    const { detail: { subnet_ip_availability = [] } = {} } = this.props;
    this.subnet_ip_availability = subnet_ip_availability;
  }

  getDataSource = () => {
    const { data, filters = {}, timeFilter = {} } = this.list;
    const { id, tab, ...rest } = filters;
    const newFilters = rest;
    let items = [];
    if (this.isFilterByBackend) {
      items = toJS(data);
    } else {
      items = (toJS(data) || []).filter((it) =>
        this.filterData(it, toJS(newFilters), toJS(timeFilter))
      );
      this.updateList({ total: items.length });
    }
    const hasTransData = items.some((item) =>
      this.itemInTransitionFunction(item)
    );
    if (hasTransData) {
      this.setRefreshDataTimerTransition();
    } else {
      this.setRefreshDataTimerAuto();
    }
    const ret = items.map((item) => {
      const usageDetail = this.subnet_ip_availability.find(
        (i) => i.subnet_id === item.id
      );
      return {
        ...usageDetail,
        ...item,
      };
    });
    return ret;
  };

  get policy() {
    return 'get_subnet';
  }

  get name() {
    return t('subnets');
  }

  get id() {
    return this.params.id;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  updateFetchParams = () => {
    const { id } = this.props.match.params;
    return {
      network_id: id,
    };
  };

  get canAddNetworkIPUsageInfo() {
    return (
      this.isAdminPage ||
      globalRootStore.user.project.id === this.props.detail.project_id
    );
  }

  getColumns = () => {
    const ret = [
      {
        title: t('Name'),
        dataIndex: 'name',
        stringify: (name, record) => name || record.id,
      },
      {
        title: t('CIDR'),
        dataIndex: 'cidr',
        isHideable: true,
      },
      {
        title: t('Gateway IP'),
        dataIndex: 'gateway_ip',
        isHideable: true,
      },
      {
        title: t('IP Version'),
        dataIndex: 'ip_version',
        isHideable: true,
      },
      {
        //   title: t('Status'),
        //   dataIndex: 'status',
        //   render: value => networkStatus[value] || '-',
        //   isHideable: true,
        // }, {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
        isHideable: true,
      },
    ];
    if (this.canAddNetworkIPUsageInfo) {
      ret.splice(
        4,
        0,
        {
          title: t('Total IPs'),
          dataIndex: 'total_ips',
        },
        {
          title: t('Used IPs'),
          dataIndex: 'used_ips',
        }
      );
    }
    return ret;
  };

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(Subnets));
