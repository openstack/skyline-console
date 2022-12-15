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
import { StepAction } from 'src/containers/Action';
import globalClusterTemplateStore from 'src/stores/magnum/clusterTemplates';
import { toJS } from 'mobx';
import StepInfo from './StepInfo';
import StepNodeSpec from './StepNodeSpec';
import StepNetwork from './StepNetwork';
import StepLabel from './StepLabel';

export class StepCreate extends StepAction {
  init() {
    this.store = globalClusterTemplateStore;
    this.getDetail();
  }

  static id = 'create-cluster-template';

  static title = t('Create Cluster Template');

  static path = '/container-infra/cluster-template/create';

  static policy = 'clustertemplate:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Cluster Template');
  }

  get listUrl() {
    return this.getRoutePath('clusterTemplate');
  }

  get isEdit() {
    return this.path.includes('update');
  }

  get hasExtraProps() {
    return this.isEdit;
  }

  get hasConfirmStep() {
    return false;
  }

  get params() {
    const { id } = this.props.match.params;
    return { id };
  }

  async getDetail() {
    if (this.isEdit) {
      const result = await globalClusterTemplateStore.fetchDetail(this.params);
      this.setState({
        extra: toJS(result),
      });
    }
  }

  get steps() {
    return [
      {
        title: t('Cluster Info'),
        component: StepInfo,
      },
      {
        title: t('Node Spec'),
        component: StepNodeSpec,
      },
      {
        title: t('Network Setting'),
        component: StepNetwork,
      },
      {
        title: t('Additional Labels'),
        component: StepLabel,
      },
    ];
  }

  onSubmit = (values) => {
    const {
      flavor,
      masterFlavor,
      additionalLabels,
      images,
      keypair,
      externalNetwork,
      fixedNetwork,
      fixedSubnet,
      ...rest
    } = values;
    const requestLabels = {};
    if (additionalLabels) {
      additionalLabels.forEach((item) => {
        const labelKey = item.value.key;
        const labelValue = item.value.value;
        requestLabels[labelKey] = labelValue;
      });
    }

    const body = {
      ...rest,
      labels: requestLabels,
      external_network_id: externalNetwork.selectedRowKeys[0],
      fixed_network: (fixedNetwork && fixedNetwork.selectedRowKeys[0]) || null,
      fixed_subnet: (fixedSubnet && fixedSubnet.selectedRowKeys[0]) || null,
      flavor_id: (flavor && flavor.selectedRowKeys[0]) || null,
      master_flavor_id:
        (masterFlavor && masterFlavor.selectedRowKeys[0]) || null,
      image_id: (images && images.selectedRowKeys[0]) || null,
      keypair_id: (keypair && keypair.selectedRowKeys[0]) || null,
    };
    if (this.isEdit) {
      return this.store.update({ id: this.params.id }, body);
    }
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(StepCreate));
