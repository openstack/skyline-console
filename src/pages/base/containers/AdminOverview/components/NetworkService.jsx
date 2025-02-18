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
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import circleFill from 'asset/cube/monochrome/circle_fill.svg';
import crossFill from 'asset/cube/monochrome/cross_fill.svg';
import CubeCard from 'src/components/cube/CubeCard';
import styles from '../style.less';

export class NetworkService extends Component {
  componentDidMount() {
    this.props.store.getNetworkService();
  }

  renderIcon = (isServiceUp) =>
    isServiceUp ? (
      <img
        src={circleFill}
        alt="avatar"
        width={16}
        height={16}
        className={styles['avatar-checked']}
      />
    ) : (
      <img
        src={crossFill}
        alt="avatar"
        width={16}
        height={16}
        className={styles['avatar-crossed']}
      />
    );

  renderAction = (item, index) => (
    <div key={`${item.binary}-${index}`} className={styles['service-card']}>
      <div>{this.renderIcon(item.alive)}</div>
      <div style={{ fontWeight: '500' }}>{item.binary}</div>
      <div>{item.host}</div>
      <div>{item.alive ? t('Up') : t('Down')}</div>
    </div>
  );

  render() {
    const { networkServiceLoading, networkService = [] } = this.props.store;

    return (
      <CubeCard
        loading={networkServiceLoading}
        className={styles.top}
        title={t('Network Service')}
        bordered={false}
      >
        {networkService.map((item, index) => this.renderAction(item, index))}
      </CubeCard>
    );
  }
}

NetworkService.propTypes = {
  store: PropTypes.object.isRequired,
};

export default inject('rootStore')(observer(NetworkService));
