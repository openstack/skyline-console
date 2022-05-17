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

export class BaseDetail extends Base {
  get leftCards() {
    return [...this.BandwidthCard, this.DSCPMarkingCard];
  }

  getOptions(rule) {
    const { max_kbps = '-', max_burst_kbps = '-' } = rule || {};
    const options = [
      {
        label: t('Max BandWidth'),
        content: `${max_kbps === '-' ? max_kbps : max_kbps / 1024} Mbps`,
      },
      {
        label: t('Max Burst'),
        content: `${
          max_burst_kbps === '-' ? max_burst_kbps : max_burst_kbps / 1024
        } Mbps`,
      },
    ];
    return options;
  }

  get BandwidthCard() {
    const { rules = [] } = this.detailData;
    const egressRule = rules.find(
      (item) => item.type === 'bandwidth_limit' && item.direction === 'egress'
    );
    const ingressRule = rules.find(
      (item) => item.type === 'bandwidth_limit' && item.direction === 'ingress'
    );
    return [
      {
        title: t('BandWidth Limit Egress'),
        options: this.getOptions(egressRule),
      },
      {
        title: t('BandWidth Limit Ingress'),
        options: this.getOptions(ingressRule),
      },
    ];
  }

  get DSCPMarkingCard() {
    const { rules = [] } = this.detailData;
    const dscpRule = rules.find((item) => item.type === 'dscp_marking') || {};
    const options = [
      {
        label: t('Value'),
        content: dscpRule.dscp_mark === 0 ? '0' : dscpRule.dscp_mark || '-',
      },
    ];
    return {
      title: t('DSCP Marking'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
