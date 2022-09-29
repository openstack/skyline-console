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

import { inject, observer } from 'mobx-react';
import { StepAction } from 'containers/Action';
import globalIronicStore from 'stores/ironic/ironic';
import { toJS } from 'mobx';
import { isEmpty, has, isEqual } from 'lodash';
import {
  updateObjToAddSelectArray,
  updateAddSelectValueToObj,
} from 'utils/index';
import { getDifFromAddSelectValue, hasValue } from 'resources/ironic/ironic';
import DriveInterface from './DriveInterface';
import DriveInfo from './DriveInfo';
import NodeInfo from './NodeInfo';

export class Create extends StepAction {
  static id = 'create';

  static title = t('Create Node');

  static path = '/compute/baremetal-node-admin/create';

  static policy = 'baremetal:node:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get listUrl() {
    return this.getRoutePath('baremetalNode');
  }

  get name() {
    return this.isEdit ? t('edit baremetal node') : t('create baremetal node');
  }

  get hasConfirmStep() {
    return false;
  }

  get hasExtraProps() {
    return this.isEdit;
  }

  get steps() {
    return [
      {
        title: t('Node Info'),
        component: NodeInfo,
      },
      {
        title: t('Driver Info'),
        component: DriveInfo,
      },
      {
        title: t('Driver Interface'),
        component: DriveInterface,
      },
    ];
  }

  get isEdit() {
    const { pathname } = this.props.location;
    return pathname.indexOf('edit') >= 0;
  }

  get id() {
    const { id } = this.props.match.params;
    return id;
  }

  init() {
    this.store = globalIronicStore;
    this.getDetail();
  }

  updateItemValueToArray = (data, key) => {
    const value = data[key] || {};
    data[key] = updateObjToAddSelectArray(value);
  };

  updateDriverInfoValue = (data) => {
    const { driver_info = {} } = data;
    Object.keys(driver_info).forEach((key) => {
      data[`driver_info_${key}`] = driver_info[key];
    });
  };

  async getDetail() {
    if (this.isEdit) {
      const result = await this.store.fetchDetail({
        id: this.id,
        onlyDetail: true,
      });
      const detail = toJS(result);
      this.updateItemValueToArray(detail, 'properties');
      this.updateItemValueToArray(detail, 'extra');
      this.updateDriverInfoValue(detail);
      this.setState({
        extra: toJS(detail),
      });
    }
  }

  updateValues = (values) => {
    const { custom_trait = [], standard_trait = [], ...rest } = values;
    const traits = [];
    custom_trait.forEach((it) => traits.push(it.value));
    traits.push(...standard_trait);
    return {
      traits,
      ...rest,
    };
  };

  // eslint-disable-next-line no-unused-vars
  onSubmit = (values) => {
    const newValue = this.updateValues(values);
    if (this.isEdit) {
      return this.submitEdit(newValue);
    }
    return this.submitCreate(newValue);
  };

  submitCreate = (values) => {
    const body = {};
    const driverInfo = {};
    const { more, ...rest } = values;
    Object.keys(rest).forEach((key) => {
      const prefix = 'driver_info_';
      if (key.indexOf(prefix) === 0) {
        const newKey = key.substring(prefix.length);
        driverInfo[newKey] = values[key];
      } else if (key === 'properties' || key === 'extra') {
        const newValue = updateAddSelectValueToObj(values[key]);
        if (!isEmpty(newValue)) {
          body[key] = newValue;
        }
      } else {
        const isEmptyName = key === 'name' && values[key] === '';
        body[key] = isEmptyName ? null : values[key];
      }
    });
    body.driver_info = driverInfo;
    return this.store.create(body);
  };

  getKeyPath = (key) => {
    const prefix = 'driver_info_';
    if (key.indexOf(prefix) === 0) {
      return `/driver_info/${key.substring(prefix.length)}`;
    }
    return `/${key}`;
  };

  submitEdit = async (values) => {
    const adds = [];
    const replaces = [];
    const dels = [];
    const { extra: originData } = this.state;
    const { properties, extra, more, traits, ...rest } = values;
    const {
      properties: oldProps,
      extra: oldExtra,
      traits: oldTraits,
    } = originData;
    Object.keys(rest).forEach((key) => {
      const value = values[key];
      const path = this.getKeyPath(key);
      const obj = { value, path };
      if (!has(originData, key) && hasValue(value)) {
        obj.op = 'add';
        adds.push(obj);
      } else {
        const oldValue = originData[key];
        if (!isEqual(oldValue, value) && (oldValue || value)) {
          if (key === 'name' && value === '') {
            obj.op = 'remove';
            dels.push(obj);
          } else {
            obj.op = 'replace';
            replaces.push(obj);
          }
        }
      }
    });
    const {
      adds: pAdds,
      replaces: pReplaces,
      dels: pDels,
    } = getDifFromAddSelectValue(properties, oldProps, 'properties');
    const {
      adds: eAdds,
      replaces: eReplaces,
      dels: eDels,
    } = getDifFromAddSelectValue(extra, oldExtra, 'extra');
    adds.push(
      ...pAdds.filter((it) => hasValue(it.value)),
      ...eAdds.filter((it) => hasValue(it.value))
    );
    replaces.push(
      ...pReplaces.filter((it) => hasValue(it.value)),
      ...eReplaces.filter((it) => hasValue(it.value))
    );
    dels.push(...pDels, ...eDels);
    const body = [...adds, ...replaces, ...dels];
    if (!isEqual(traits, oldTraits)) {
      await this.store.updateTraits(this.id, traits);
    }
    if (body.length === 0) {
      return Promise.resolve();
    }
    return this.store.edit({ id: this.id }, body);
  };
}

export default inject('rootStore')(observer(Create));
