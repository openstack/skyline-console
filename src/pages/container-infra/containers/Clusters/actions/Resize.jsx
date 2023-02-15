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

import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { ModalAction } from 'src/containers/Action';
import globalClustersStore from 'stores/magnum/clusters';
import globalProjectStore from 'stores/keystone/project';

export class Resize extends ModalAction {
  init() {
    this.store = globalClustersStore;
    this.projectStore = globalProjectStore;
    this.state.quotaLoading = true;
    this.getQuota();
  }

  static id = 'resize-cluster';

  static title = t('Resize Cluster');

  static policy = 'cluster:resize';

  static get modalSize() {
    return 'middle';
  }

  getModalSize() {
    return 'middle';
  }

  static allowed(item) {
    const { status } = item;
    return Promise.resolve(status.includes('COMPLETE'));
  }

  get name() {
    return t('Resize Cluster');
  }

  get maxSize() {
    const { node_count = 0 } = this.item;

    const { instances: { left = 0 } = {} } =
      toJS(this.projectStore.novaQuota) || {};
    if (left === -1) {
      return null;
    }

    return left + node_count;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    this.setState({
      quotaLoading: true,
    });
    await this.projectStore.fetchProjectNovaQuota();
    this.setState({
      quotaLoading: false,
    });
  }

  get quotaInfo() {
    const { quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    const { newNodes } = this.getNodesInput();
    const { instances = {} } = toJS(this.projectStore.novaQuota) || {};
    const { left } = instances;
    const instanceQuotaInfo = {
      ...instances,
      add: left === 0 ? 0 : newNodes,
      name: 'instance',
      title: t('Instance'),
    };

    const quotaInfo = [instanceQuotaInfo];

    return quotaInfo;
  }

  getNodesInput() {
    const { node_count = 0 } = this.item;
    const { changed_node_count = 0 } = this.state;
    const newNodes = changed_node_count - node_count;
    return {
      newNodes: newNodes > 0 ? newNodes : 0,
    };
  }

  get defaultValue() {
    const { node_count = 0, master_count = 0 } = this.item;

    return {
      current_master_node_count: master_count,
      current_node_count: node_count,
      changed_node_count: node_count + 1,
    };
  }

  get nameForStateUpdate() {
    return ['changed_node_count'];
  }

  get formItems() {
    const { changed_node_count } = this.state;
    const { node_count = 0 } = this.item;

    return [
      {
        name: 'current_master_node_count',
        label: t('Current Master Node Count'),
        type: 'label',
      },
      {
        name: 'current_node_count',
        label: t('Current Node Count'),
        type: 'label',
      },
      {
        name: 'changed_node_count',
        label: t('Changed Node Count'),
        type: 'input-int',
        min: 1,
        max: this.maxSize,
        required: true,
        validator: (rule, value) => {
          if (value === node_count) {
            return Promise.reject(
              new Error(
                t(
                  'The changed node count can not be equal to the current value'
                )
              )
            );
          }
          return Promise.resolve();
        },
      },
      {
        name: 'nodes_to_remove',
        label: t('Nodes To Remove'),
        type: 'textarea',
        placeholder: t(
          'Please enter the server id to be reduced, and separate different id with ","'
        ),
        validator: (rule, value) => {
          const pattern = /^[0-9a-zA-Z]+([0-9a-zA-Z,-][0-9a-zA-Z]+)*$/;
          if (value && !pattern.test(value)) {
            return Promise.reject(new Error(t('Please enter the correct id')));
          }
          return Promise.resolve();
        },
        display: changed_node_count < node_count,
      },
    ];
  }

  onSubmit = (values) => {
    const { changed_node_count, nodes_to_remove } = values;

    const body = {
      node_count: changed_node_count,
      nodes_to_remove: [],
    };
    if (nodes_to_remove) {
      body.nodes_to_remove = nodes_to_remove.split(',');
    }

    return this.store.resize({ id: this.item.id }, body);
  };
}

export default inject('rootStore')(observer(Resize));
