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
import { inject, observer } from 'mobx-react';
import QuotaOverview from 'pages/base/containers/Overview/components/QuotaOverview';
import { VolumeTypeStore } from 'stores/cinder/volume-type';
import { ProjectStore } from 'stores/keystone/project';
import styles from './index.less';

export class Quota extends Component {
  constructor(props) {
    super(props);
    this.projectStore = new ProjectStore();
    this.volumeTypeStore = new VolumeTypeStore();
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  get volumeTypeData() {
    if (!this.enableCinder) return [];
    return this.volumeTypeStore.projectVolumeTypes;
  }

  getData = async () => {
    const { id: project_id } = this.props.match.params;
    const promiseArr = [
      this.projectStore.fetchProjectQuota({
        project_id,
      }),
    ];
    if (this.enableCinder) {
      promiseArr.push(this.volumeTypeStore.fetchProjectVolumeTypes(project_id));
    }
    return Promise.all(promiseArr);
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <QuotaOverview
          getData={this.getData}
          projectStore={this.projectStore}
          volumeTypeStore={this.volumeTypeStore}
          volumeTypeData={this.volumeTypeData}
        />
      </div>
    );
  }
}

export default inject('rootStore')(observer(Quota));
