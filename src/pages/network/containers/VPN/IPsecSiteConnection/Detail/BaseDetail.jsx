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
import Base from 'containers/BaseDetail';
import { VpnIPsecConnectionStore } from 'stores/neutron/vpn-ipsec-connection';
import React from 'react';
import { toJS } from 'mobx';

export class BaseDetail extends Base {
  init() {
    this.store = new VpnIPsecConnectionStore();
  }

  fetchData = async (params) => {
    this.store
      .fetchDetailWithPolicyDetail({
        id: this.id,
        ikePolicyID: this.props.detail.ikepolicy_id,
        ipsecPolicyID: this.props.detail.ipsecpolicy_id,
        ...params,
      })
      .catch(this.catch);
  };

  get detailData() {
    return toJS(this.store.detail);
  }

  get leftCards() {
    const cards = [this.ikeInfoCard, this.ipsecInfoCard];
    return cards;
  }

  get rightCards() {
    return [this.advancedInfo];
  }

  get ikeInfoCard() {
    const options = [
      {
        label: t('Name'),
        dataIndex: 'name',
      },
      {
        label: t('Description'),
        dataIndex: 'description',
        render: (value) => value || '-',
      },
      {
        label: t('Auth Algorithm'),
        dataIndex: 'auth_algorithm',
      },
      {
        label: t('Encryption Algorithm'),
        dataIndex: 'encryption_algorithm',
      },
      {
        label: t('IKE Version'),
        dataIndex: 'ike_version',
      },
      {
        label: t('Lifetime'),
        dataIndex: 'lifetime',
        render: (lifeTime) =>
          lifeTime && (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {Object.keys(lifeTime).map((i, index) => (
                <li
                  key={`${index}_${lifeTime[i]}_lifeTime`}
                >{`${i}: ${lifeTime[i]}`}</li>
              ))}
            </ul>
          ),
      },
      {
        label: t('PFS'),
        dataIndex: 'pfs',
      },
    ];
    return {
      title: t('IKE Policy'),
      options,
      sourceData: this.detailData.ikeDetail,
    };
  }

  get ipsecInfoCard() {
    const options = [
      {
        label: t('Name'),
        dataIndex: 'name',
      },
      {
        label: t('Description'),
        dataIndex: 'description',
      },
      {
        label: t('Auth Algorithm'),
        dataIndex: 'auth_algorithm',
      },
      {
        label: t('Encapsulation Mode'),
        dataIndex: 'encapsulation_mode',
      },
      {
        label: t('Encryption Algorithm'),
        dataIndex: 'encryption_algorithm',
      },
      {
        label: t('Transform Protocol'),
        dataIndex: 'transform_protocol',
      },
      {
        label: t('Lifetime'),
        dataIndex: 'lifetime',
        render: (lifeTime) =>
          lifeTime && (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {Object.keys(lifeTime).map((i, index) => (
                <li
                  key={`${index}_${lifeTime[i]}_lifeTime`}
                >{`${i}: ${lifeTime[i]}`}</li>
              ))}
            </ul>
          ),
      },
      {
        label: t('PFS'),
        dataIndex: 'pfs',
      },
    ];
    return {
      title: t('IPsec Policy'),
      options,
      sourceData: this.detailData.ipsecDetail,
    };
  }

  get advancedInfo() {
    const options = [
      {
        label: t('MTU'),
        dataIndex: 'mtu',
      },
      {
        label: t('Initiator Mode'),
        dataIndex: 'initiator',
      },
      {
        label: t('DPD Action'),
        dataIndex: 'dpd',
        render: (dpd) => dpd && dpd.action,
      },
      {
        label: t('DPD Interval (sec)'),
        dataIndex: 'dpd',
        render: (dpd) => dpd && dpd.interval,
      },
      {
        label: t('DPD timeout (sec)'),
        dataIndex: 'dpd',
        render: (dpd) => dpd && dpd.timeout,
      },
    ];
    return {
      title: t('Advanced Params'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
