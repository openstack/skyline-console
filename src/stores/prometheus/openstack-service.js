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

import { action, observable, set } from 'mobx';
import { getPromises } from 'components/PrometheusChart/utils/utils';
import MonitorBase from './monitor-base';

const serviceNameMap = {
  mysql_up: t('Database Service'),
  rabbitmq_identity_info: t('Message Queue Service'),
  memcached_up: t('Cache Service'),
};

const indexToServiceName = [
  t('Database Service'),
  t('Message Queue Service'),
  t('Cache Service'),
];

export class OpenstackServiceStore extends MonitorBase {
  // @observable
  // nodes = [];

  // @observable
  // node = {};

  @observable
  nova_service = {
    isLoading: false,
    data: [],
  };

  @observable
  network_service = {
    isLoading: false,
    data: [],
  };

  @observable
  cinder_service = {
    isLoading: false,
    data: [],
  };

  @observable
  other_service = {
    isLoading: false,
    data: [],
  };

  @action
  getChartData = async () => {
    // const { hostname } = this.node.metric;
    const defaultPromises = [
      this.getNovaService(),
      this.getNetworkService(),
      this.getCinderService(),
      this.getOtherService(),
    ];
    await Promise.all(defaultPromises);
  };

  @action
  getNovaService = async () => {
    set(this.nova_service, {
      isLoading: true,
      data: [],
    });
    const tmp = [];
    try {
      const [currentState, last24State, libvirtdState, libvirtd24State] =
        await Promise.all(getPromises('openstackService.novaService'));
      const {
        data: { result: currentStateResult },
      } = currentState;
      currentStateResult.forEach((service) => {
        const {
          metric: {
            service: serviceName = '',
            adminState = '',
            hostname = '',
          } = {},
        } = service;
        tmp.push({
          hostname,
          serviceName,
          state: adminState === 'enabled' ? 'up' : 'down',
        });
      });
      const {
        data: { result: last24HResult },
      } = last24State;
      last24HResult.forEach((service) => {
        const { metric: { service: serviceName = '', hostname = '' } = {} } =
          service;
        const idx = tmp.findIndex(
          (item) =>
            item.serviceName === serviceName && item.hostname === hostname
        );
        tmp[idx][`${serviceName}24`] = 'down';
      });
      const {
        data: { result: data },
      } = libvirtdState;
      data.forEach((item) => {
        const { metric, value } = item;
        tmp.push({
          // hard code
          serviceName: 'nova_libvirt',
          hostname: metric.hostname,
          state: value[1] === 'enabled' ? 'up' : 'down',
        });
      });
      const {
        data: { result: libvirtd24Result },
      } = libvirtd24State;
      libvirtd24Result.forEach((service) => {
        const { metric: { hostname = '' } = {} } = service;
        const idx = tmp.findIndex(
          (item) =>
            item.serviceName === 'nova_libvirt' && item.hostname === hostname
        );
        tmp[idx].nova_libvirt24 = 'down';
      });
    } finally {
      set(this.nova_service, {
        isLoading: false,
        data: tmp,
      });
    }
  };

  @action
  getNetworkService = async () => {
    set(this.network_service, {
      isLoading: true,
      data: [],
    });
    const tmp = [];
    try {
      const [currentState, last24State] = await Promise.all(
        getPromises.call(this, 'openstackService.networkService')
      );
      const {
        data: { result: currentStateResult },
      } = currentState;
      currentStateResult.forEach((service) => {
        const {
          metric: {
            service: serviceName = '',
            adminState = '',
            hostname = '',
          } = {},
        } = service;
        tmp.push({
          serviceName,
          hostname,
          state: adminState,
        });
      });
      const {
        data: { result: last24HResult },
      } = last24State;
      last24HResult.forEach((service) => {
        const { metric: { service: serviceName = '', hostname = '' } = {} } =
          service;
        const idx = tmp.findIndex(
          (item) =>
            item.serviceName === serviceName && item.hostname === hostname
        );
        tmp[idx][`${serviceName}24`] = 'down';
      });
    } finally {
      set(this.network_service, {
        isLoading: false,
        data: tmp,
      });
    }
  };

  @action
  getCinderService = async () => {
    set(this.cinder_service, {
      isLoading: true,
      data: [],
    });
    const tmp = [];
    try {
      const [currentState, last24State] = await Promise.all(
        getPromises.call(this, 'openstackService.cinderService')
      );
      const {
        data: { result: currentStateResult },
      } = currentState;
      currentStateResult.forEach((service) => {
        const {
          metric: {
            service: serviceName = '',
            adminState = '',
            hostname = '',
          } = {},
        } = service;
        tmp.push({
          serviceName,
          hostname,
          state: adminState === 'enabled' ? 'up' : 'down',
        });
      });
      const {
        data: { result: last24HResult },
      } = last24State;
      last24HResult.forEach((service) => {
        const { metric: { service: serviceName = '', hostname = '' } = {} } =
          service;
        const idx = tmp.findIndex(
          (item) =>
            item.serviceName === serviceName && item.hostname === hostname
        );
        tmp[idx][`${serviceName}24`] = 'down';
      });
    } finally {
      set(this.cinder_service, {
        isLoading: false,
        data: tmp,
      });
    }
  };

  @action
  getOtherService = async () => {
    set(this.other_service, {
      isLoading: true,
      data: [],
    });
    const tmp = [];
    try {
      let results = await Promise.all(
        getPromises.call(this, 'openstackService.otherService')
      );
      results.forEach((result) => {
        const {
          data: { result: data },
        } = result;
        data.forEach((d) => {
          const { metric, value } = d;
          tmp.push({
            serviceName: serviceNameMap[metric.__name__],
            hostname: metric.instance,
            state: value[1] === '1' ? 'up' : 'down',
          });
        });
      });
      results = await Promise.all(
        getPromises.call(this, 'openstackService.otherServiceMinOverTime')
      );
      results.forEach((result, index) => {
        const {
          data: { result: last24HResult },
        } = result;
        last24HResult.forEach((service) => {
          const { metric: { instance = '' } = {} } = service;
          const idx = tmp.findIndex(
            (item) =>
              item.serviceName === indexToServiceName[index] &&
              item.hostname === instance
          );
          tmp[idx][`${indexToServiceName[index]}24`] = 'down';
        });
      });
      // const [heatResponse, heat24Response] = await Promise.all(
      //   getPromises.call(this, 'openstackService.heatMinOverTime')
      // );
      // const {
      //   data: { result: heatResults },
      // } = heatResponse;
      // heatResults.forEach((item) => {
      //   const {
      //     metric: {
      //       host = '',
      //       binary = '',
      //       engine_id = '',
      //       services_status = '',
      //     } = {},
      //   } = item;
      //   tmp.push({
      //     serviceName: binary,
      //     host,
      //     state: services_status,
      //     engine_id,
      //   });
      // });
      // const {
      //   data: { result: heat24Results },
      // } = heat24Response;
      // heat24Results.forEach((result) => {
      //   const { metric: { binary = '', engine_id = '', host = '' } = {} } =
      //     result;
      //   const idx = tmp.findIndex(
      //     (item) =>
      //       item.serviceName === binary &&
      //       item.host === host &&
      //       item.engine_id === engine_id
      //   );
      //   tmp[idx][`${binary}24`] = 'down';
      // });
    } finally {
      set(this.other_service, {
        isLoading: false,
        data: tmp,
      });
    }
  };
}

const globalOpenstackServiceStore = new OpenstackServiceStore();

export default globalOpenstackServiceStore;
