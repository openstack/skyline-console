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

import { observer, inject } from 'mobx-react';
import Base from 'containers/TabList';
import { vpnEndpoint } from 'client/client/constants';
import VPNGateway from './VPNGateway';
import EndPointGroup from './EndpointGroup';
import IKEPolicy from './IKEPolicy';
import IPsecPolicy from './IPsecPolicy';
import IPsecSiteConnection from './IPsecSiteConnection';

export class VPN extends Base {
  get name() {
    return t('VPN');
  }

  get checkEndpoint() {
    return true;
  }

  get endpoint() {
    return vpnEndpoint();
  }

  get tabs() {
    return [
      {
        title: t('VPN Gateways'),
        key: 'vpn_gateway',
        component: VPNGateway,
      },
      {
        title: t('VPN EndPoint Groups'),
        key: 'vpn_endpoint_groups',
        component: EndPointGroup,
      },
      {
        title: t('IKE Policies'),
        key: 'ike_policy',
        component: IKEPolicy,
      },
      {
        title: t('IPsec Policies'),
        key: 'ipsec_policy',
        component: IPsecPolicy,
      },
      {
        title: t('IPsec Site Connections'),
        key: 'ipsec_site_connections',
        component: IPsecSiteConnection,
      },
    ];
  }
}

export default inject('rootStore')(observer(VPN));
