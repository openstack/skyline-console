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
import { Radio } from 'antd';
import Mysql from './components/Mysql';
import RabbitMQ from './components/RabbitMQ';
import Memcache from './components/Memcache';
import styles from './index.less';

export class OtherService extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'mysql',
    };
  }

  handleTypeChange = (e) => {
    this.setState({
      type: e.target.value,
    });
  };

  renderTypeSelect = () => {
    const { type } = this.state;
    return (
      <Radio.Group onChange={this.handleTypeChange} value={type}>
        <Radio.Button value="mysql">MySQL</Radio.Button>
        <Radio.Button value="memcache">Memcache</Radio.Button>
        <Radio.Button value="rabbitmq">RabbitMQ</Radio.Button>
      </Radio.Group>
    );
  };

  renderSelectTab = () => {
    const { type } = this.state;
    let Cmp = null;
    switch (type) {
      case 'mysql':
        Cmp = Mysql;
        break;
      case 'memcache':
        Cmp = Memcache;
        break;
      case 'rabbitmq':
        Cmp = RabbitMQ;
        break;
      default:
        Cmp = Mysql;
        break;
    }
    return <Cmp type={type} />;
  };

  render() {
    return (
      <div className={styles.container}>
        <div style={{ padding: '20px 20px 0 20px' }}>
          {this.renderTypeSelect()}
        </div>
        <div className={styles.content}>{this.renderSelectTab()}</div>
      </div>
    );
  }
}

export default observer(OtherService);
