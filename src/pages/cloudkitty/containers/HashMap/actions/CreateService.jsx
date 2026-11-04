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
import { ModalAction } from 'containers/Action';
import globalCloudKittyHashMapServiceStore from 'stores/cloudkitty/hashmapService';

// Create a hashmap service. The operator either picks a service name from the
// collector-provided metrics (GET /v1/info/metrics) or types a custom service
// name for an additional collector. Either way a single
// POST /v1/rating/module_config/hashmap/services { name } is sent.
export class CreateService extends ModalAction {
  static id = 'create-hashmap-service';

  static title = t('Create Service');

  static buttonText = t('Create Service');

  init() {
    this.store = globalCloudKittyHashMapServiceStore;
    // Populate the collector-metrics dropdown. The store holds `metrics` as an
    // observable; this component is an observer, so formItems re-renders when
    // the fetch resolves.
    this.store.fetchMetrics();
  }

  get name() {
    return t('create service');
  }

  static policy = 'rating:module_config';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return { service_type: 'service' };
  }

  // Mirror the radio selection into this.state so formItems can toggle the
  // Service vs Custom Service inputs.
  get nameForStateUpdate() {
    return ['service_type'];
  }

  get metricOptions() {
    return (this.store.metrics || []).map((m) => ({ label: m, value: m }));
  }

  get formItems() {
    const { service_type: serviceType = 'service' } = this.state;
    const isCustom = serviceType === 'custom_service';
    const options = this.metricOptions;
    const hasMetrics = options.length > 0;

    return [
      {
        name: 'service_type',
        label: t('Service Type'),
        type: 'radio',
        options: [
          { label: t('Service'), value: 'service' },
          { label: t('Custom Service'), value: 'custom_service' },
        ],
        required: true,
        tip: t(
          'Service: choose a metric provided by the main collector. Custom Service: define a name for any additional collector.'
        ),
      },
      {
        name: 'service',
        label: t('Service'),
        type: 'select',
        options,
        required: !isCustom,
        hidden: isCustom,
        showSearch: true,
        placeholder: hasMetrics
          ? t('Select a collector metric')
          : t('No collector metrics available'),
        tip: t('Services are provided by the main collector.'),
      },
      {
        name: 'custom_service',
        label: t('Custom Service'),
        // Plain input rather than input-name: collector metric names such as
        // "image.size" are valid service names and must not be rejected by the
        // stricter name validator.
        type: 'input',
        required: isCustom,
        hidden: !isCustom,
        tip: t('Custom services can be defined for any additional collector.'),
      },
    ];
  }

  onSubmit = (values) => {
    const name =
      values.service_type === 'custom_service'
        ? (values.custom_service || '').trim()
        : values.service;
    return this.store.create({ name });
  };
}

export default inject('rootStore')(observer(CreateService));
