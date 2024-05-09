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
  describe('Skip The Network Firewall Policy Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(fwaasEnabled, () => {
  describe('The Firewall Policy Page', () => {
    const listUrl = firewallListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-firewall-policy-${uuid}`;
    const newname = `${name}-1`;
    const ruleName = `e2e-rule-for-fw-policy-${uuid}`;

    beforeEach(() => {
      cy.login(listUrl).wait(5000).clickTab('Firewall Policies', 'policies');
    });

    it('successfully prepair resource', () => {
      cy.createFirewallRule({ name: ruleName });
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(0)
        .formInput('name', name)
        .formText('description', name)
        .clickModalActionSubmitButton();
    });

    it('successfully detail', () => {
      cy.tableSearchText(name).goToDetail().checkDetailName(name);
      cy.goBackToList(listUrl);
    });

    it('successfully insert rule', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Insert Rule')
        .formTableSelectBySearch('rule', ruleName)
        .clickModalActionSubmitButton();
    });

    it('successfully remove rule', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Remove Rule')
        .formTableSelectBySearch('rule', ruleName)
        .clickModalActionSubmitButton();
    });

    it('successfully edit', () => {
      cy.tableSearchText(name)
        .clickFirstActionButton()
        .wait(5000)
        .formInput('name', newname)
        .formText('description', 'description')
        .clickModalActionSubmitButton();
    });

    it('successfully delete', () => {
      cy.tableSearchText(newname).clickConfirmActionInMore('Delete');
    });

    it('successfully disable delete', () => {
      cy.tableSearchText('default ingress')
        .selectFirst()
        .clickHeaderActionButtonByTitle('Delete')
        .checkDisableAction();
    });

    it('successfully delete related resources', () => {
      cy.deleteAll('firewall', ruleName, 'Firewall Rules');
    });
  });
});
