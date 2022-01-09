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

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { OpenstackServiceStore } from 'stores/prometheus/openstack-service';
import { SyncOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Services from './Services';
import styles from './index.less';

@observer
class OpenstackService extends Component {
  constructor(props) {
    super(props);
    const { Store = OpenstackServiceStore } = props;
    this.store = new Store();
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    // await this.store.getNodes();
    await this.store.getChartData();
  };

  handleRefresh = () => {
    this.getData();
  };

  render() {
    const { nova_service, network_service, other_service, cinder_service } =
      this.store;
    const serviceMap = [
      {
        key: 'nova_service',
        title: t('Nova Service'),
        ...nova_service,
      },
      {
        key: 'network_service',
        title: t('Neutron Service'),
        ...network_service,
      },
      {
        key: 'cinder_service',
        title: t('Cinder Service'),
        ...cinder_service,
      },
      {
        key: 'other_service',
        title: t('Other Service'),
        ...other_service,
      },
    ];

    return (
      <div className={styles.container}>
        <Button
          type="default"
          icon={<SyncOutlined />}
          onClick={this.handleRefresh}
        />
        {/* <NodeSelect style={{ display: 'inline', marginLeft: 20 }} store={this.store} /> */}
        <Services serviceMap={serviceMap} />
      </div>
    );
  }
}

export default OpenstackService;
