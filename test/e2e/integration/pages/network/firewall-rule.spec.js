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
  describe('Skip The Network Firewall Rule Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(fwaasEnabled, () => {
  describe('The Firewall Rule Page', () => {
    const listUrl = firewallListUrl;
    const name = `e2e-firewall-rule-${Cypress._.random(0, 1e6)}`;
    const newname = `${name}-1`;

    beforeEach(() => {
      cy.login(listUrl).wait(5000).clickTab('Firewall Rules', 'rules');
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(0)
        .wait(2000)
        .formInput('name', name)
        .formText('description', name)
        .clickFormActionSubmitButton();
    });

    it('successfully detail', () => {
      cy.tableSearchText(name).goToDetail().checkDetailName(name);
      cy.goBackToList(listUrl);
    });

    it('successfully edit', () => {
      cy.tableSearchText(name)
        .clickFirstActionButton()
        .wait(5000)
        .formInput('name', newname)
        .formText('description', 'description')
        .clickFormActionSubmitButton();
    });

    it('successfully delete', () => {
      cy.tableSearchText(newname).clickConfirmActionButton('Delete');
    });
  });
});
