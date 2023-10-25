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

import { ModalAction } from 'containers/Action';
import { inject, observer } from 'mobx-react';
import {
  ZONE_TYPE_ENUM,
  validateZoneName,
  zoneNameMessage,
  zoneTypeOptions,
} from 'src/resources/dns/zone';
import globalDNSZonesStore from 'src/stores/designate/zones';
import { emailValidate, ipValidate } from 'utils/validate';

export class Create extends ModalAction {
  init() {
    this.store = globalDNSZonesStore;
  }

  static id = 'create_zone';

  static title = t('Create Zone');

  static get modalSize() {
    return 'small';
  }

  get name() {
    return t('Create Zone');
  }

  static policy = 'create_zone';

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    return {
      ttl: 3600,
      type: ZONE_TYPE_ENUM.primary,
    };
  }

  get nameForStateUpdate() {
    return ['type'];
  }

  validateMasters = (rule, value) => {
    if (!value || !value.length) {
      return Promise.resolve();
    }
    const errorItem = value.find((v) => {
      if (!v.value) {
        return true;
      }
      if (!ipValidate.isIPv4(v.value) && !!ipValidate.isIpv6(v.value)) {
        return true;
      }
      return false;
    });
    if (errorItem) {
      return Promise.reject(t('Please input a valid ip!'));
    }
    const sameItem = value.find((v) => {
      const theSame = value.find((vv) => {
        return vv.value === v.value && vv.index !== v.index;
      });
      return !!theSame;
    });
    if (sameItem) {
      return Promise.reject(
        t('The ip address {ip} is duplicated, please modify it.', {
          ip: sameItem.value,
        })
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    const { type = ZONE_TYPE_ENUM.primary } = this.state;
    const isPrimaryType = type === ZONE_TYPE_ENUM.primary;
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true,
        extra: zoneNameMessage,
        validator: validateZoneName,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'type',
        label: t('Type'),
        type: 'select',
        options: zoneTypeOptions,
        tip: t(
          'Primary is controlled by Designate, Secondary zones are slaved from another DNS Server.'
        ),
      },
      {
        name: 'email',
        label: t('Email Address'),
        type: 'input',
        required: isPrimaryType,
        hidden: !isPrimaryType,
        validator: emailValidate,
        extra: t('Email for the zone. Used in SOA records for the zone.'),
      },
      {
        name: 'ttl',
        label: t('TTL'),
        type: 'input-number',
        min: 0,
        required: isPrimaryType,
        hidden: !isPrimaryType,
        extra: t('TTL (Time to Live) for the zone.'),
      },
      {
        name: 'masters',
        label: t('Masters'),
        type: 'add-select',
        isInput: true,
        placeholder: t('Please input ip address'),
        tip: t(
          'Mandatory for secondary zones. The servers to slave from to get DNS information.'
        ),
        minCount: 1,
        hidden: isPrimaryType,
        required: !isPrimaryType,
        validator: this.validateMasters,
      },
    ];
  }

  onSubmit = (values) => {
    const { masters = [], type, email, ttl, ...rest } = values;
    const body = {
      ...rest,
      type,
      masters: masters.map((m) => m.value),
    };
    if (type === 'PRIMARY') {
      body.email = email;
      body.ttl = ttl;
    }
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(Create));
