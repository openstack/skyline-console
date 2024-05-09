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
import { firewallListUrl } from '../../../support/constants';

const fwaasEnabled = (Cypress.env('extensions') || []).includes(
  'neutron::firewall'
);

onlyOn(!fwaasEnabled, () => {
  describe('Skip The Network Firewall Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(fwaasEnabled, () => {
  describe('The Firewall Page', () => {
    const listUrl = firewallListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-firewall-${uuid}`;
    const newname = `${name}-1`;
    const inPolicyName = `e2e-ingress-policy-for-firewall-${uuid}`;
    const ePolicyName = `e2e-egress-policy-for-firewall-${uuid}`;
    const networkName = `e2e-network-for-firewall-${uuid}`;
    const routerName = `e2e-network-for-firewall-${uuid}`;

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully prepair resource', () => {
      cy.createFirewallPolicy({ name: inPolicyName });
      cy.createFirewallPolicy({ name: ePolicyName });
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(0)
        .wait(5000)
        .formInput('name', name)
        .formTableSelectBySearch('ingressPolicy', inPolicyName)
        .formTableSelectBySearch('egressPolicy', ePolicyName)
        .formTabClick('ports', 1)
        .wait(2000)
        .formTableSelectBySearch('ports', networkName)
        .formText('description', name)
        .clickFormActionSubmitButton();
    });

    it('successfully detail', () => {
      cy.tableSearchText(name).goToDetail().clickDetailTab('Ports', 'ports');
      cy.goBackToList(listUrl);
    });

    it('successfully disable delete', () => {
      cy.tableSearchText(name)
        .selectAll()
        .clickHeaderActionButtonByTitle('Delete')
        .checkDisableAction();
    });

    it('successfully manage port', () => {
      cy.tableSearchText(name)
        .clickActionButtonByTitle('Manage Ports')
        .formTabClick('ports', 1)
        .wait(2000)
        .formTableClearSelect('ports')
        .clickModalActionSubmitButton();
    });

    it('successfully edit', () => {
      cy.tableSearchText(name)
        .clickFirstActionButton()
        .wait(5000)
        .formInput('name', newname)
        .formTableClearSelect('ingressPolicy')
        .formTableClearSelect('egressPolicy')
        .formText('description', 'description')
        .clickModalActionSubmitButton();
    });

    it('successfully delete', () => {
      cy.tableSearchText(newname).clickConfirmActionInMore('Delete');
    });

    it('successfully delete related resources', () => {
      cy.deleteAll('firewall', inPolicyName, 'Firewall Policies');
      cy.deleteAll('firewall', ePolicyName, 'Firewall Policies');
      cy.deleteRouter(routerName, networkName);
      cy.deleteAll('network', networkName);
    });
  });
});
