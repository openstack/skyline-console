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

import { onlyOn } from '@cypress/skip-test';
import { vpnListUrl } from '../../../support/constants';

const vpnServiceEnabled = (Cypress.env('extensions') || []).includes(
  'neutron::vpn'
);

onlyOn(!vpnServiceEnabled, () => {
  describe('The VPN Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(vpnServiceEnabled, () => {
  describe('The VPN Page', () => {
    const listUrl = vpnListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const gateway = `e2e-gateway-${uuid}`;
    const endpointLocal = `e2e-endpoint-local-${uuid}`;
    const endpointPeer = `e2e-endpoint-peer-${uuid}`;
    const ikePolicy = `e2e-ike-policy-${uuid}`;
    const ipsecPolicy = `e2e-ipsec-policy-${uuid}`;
    const ipsecSiteConnection = `e2e-ipsec-site-connection-${uuid}`;

    const cidr = '192.168.0.0/24';

    const networkName = `e2e-network-for-vpn-${uuid}`;
    const routerName = `e2e-router-for-vpn-${uuid}`;

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
    });

    it('successfully create gateway', () => {
      cy.clickHeaderActionButton(0)
        .formInput('name', gateway)
        .formText('description', gateway)
        .formTableSelectBySearch('router_id', routerName)
        .clickModalActionSubmitButton();
    });

    it('successfully create local endpoint', () => {
      cy.clickTab('VPN EndPoint Groups', 'vpn_endpoint_groups')
        .clickHeaderActionButton(0)
        .wait(5000)
        .formInput('name', endpointLocal)
        .formText('description', endpointLocal)
        .formSelect('type', 'Local')
        .formTableSelectBySearch('router_id', routerName)
        .wait(5000)
        .formTableSelect('subnet_id')
        .clickModalActionSubmitButton();
    });

    it('successfully create peer endpoint', () => {
      cy.clickTab('VPN EndPoint Groups', 'vpn_endpoint_groups')
        .clickHeaderActionButton(0)
        .formInput('name', endpointPeer)
        .formText('description', endpointPeer)
        .formSelect('type', 'Peer')
        .wait(2000)
        .formText('endpoints', cidr)
        .clickModalActionSubmitButton();
    });

    it('successfully create ike policy', () => {
      cy.clickTab('IKE Policies', 'ike_policy')
        .clickHeaderActionButton(0)
        .formInput('name', ikePolicy)
        .formText('description', ikePolicy)
        .clickModalActionSubmitButton();
    });

    it('successfully create ipsec policy', () => {
      cy.clickTab('IPsec Policies', 'ipsec_policy')
        .clickHeaderActionButton(0)
        .formInput('name', ipsecPolicy)
        .formText('description', ipsecPolicy)
        .clickModalActionSubmitButton();
    });

    it('successfully create ipsec site connection', () => {
      cy.clickTab('IPsec Site Connections', 'ipsec_site_connections')
        .clickHeaderActionButton(0)
        .wait(5000)
        .formInput('name', ipsecSiteConnection)
        .formText('description', ipsecSiteConnection)
        .formSelect('vpnservice_id', gateway)
        .formSelect('ikepolicy_id', ikePolicy)
        .formSelect('ipsecpolicy_id', ipsecPolicy)
        .formSelect('local_ep_group_id', endpointLocal)
        .wait(2000)
        .formInput('peer_address', '192.168.1.1')
        .formSelect('peer_ep_group_id', endpointPeer)
        .formInput('password', 'passW0rd')
        .formInput('confirmPassword', 'passW0rd')
        .formButtonClick('more')
        .clickModalActionSubmitButton();
    });

    it('successfully detail ipsec site connection', () => {
      cy.clickTab(
        'IPsec Site Connections',
        'ipsec_site_connections'
      ).tableSearchText(ipsecSiteConnection);
      cy.goToDetail().wait(30000);
      cy.goBackToList(listUrl);
    });

    it('successfully edit ipsec site connection', () => {
      cy.clickTab('IPsec Site Connections')
        .tableSearchText(ipsecSiteConnection)
        .clickFirstActionButton()
        .formText('description', 'description')
        .clickModalActionSubmitButton();
    });

    it('successfully delete ipsec site connection', () => {
      cy.clickTab('IPsec Site Connections')
        .tableSearchText(ipsecSiteConnection)
        .clickConfirmActionButton('Delete');
    });

    it('successfully edit ipsec policy', () => {
      cy.clickTab('IPsec Policies')
        .tableSearchText(ipsecPolicy)
        .clickFirstActionButton()
        .formText('description', 'description')
        .clickModalActionSubmitButton();
    });

    it('successfully delete ipsec policy', () => {
      cy.clickTab('IPsec Policies')
        .tableSearchText(ipsecPolicy)
        .clickConfirmActionButton('Delete');
    });

    it('successfully edit ike policy', () => {
      cy.clickTab('IKE Policies')
        .tableSearchText(ikePolicy)
        .clickFirstActionButton()
        .formText('description', 'description')
        .clickModalActionSubmitButton();
    });

    it('successfully delete ike policy', () => {
      cy.clickTab('IKE Policies')
        .tableSearchText(ikePolicy)
        .clickConfirmActionButton('Delete');
    });

    it('successfully edit endpoint', () => {
      cy.clickTab('VPN EndPoint Groups')
        .tableSearchText(endpointLocal)
        .clickFirstActionButton()
        .formText('description', 'description')
        .clickModalActionSubmitButton();
    });

    it('successfully delete endpoint', () => {
      cy.clickTab('VPN EndPoint Groups')
        .tableSearchText(endpointLocal)
        .clickConfirmActionButton('Delete')
        .wait(5000)
        .tableSearchText(endpointPeer)
        .clickConfirmActionButton('Delete');
    });

    it('successfully edit gateway', () => {
      cy.tableSearchText(gateway)
        .clickFirstActionButton()
        .formText('description', 'description')
        .clickModalActionSubmitButton();
    });

    it('successfully delete gateway', () => {
      cy.tableSearchText(gateway).clickConfirmActionButton('Delete');
    });

    it('successfully delete related resources', () => {
      cy.deleteRouter(routerName, networkName);
      cy.deleteAll('network', networkName);
    });
  });
});
