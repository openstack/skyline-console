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
import { lbListUrl } from '../../../support/constants';

const lbServiceEnabled = (Cypress.env('extensions') || []).includes('octavia');

onlyOn(!lbServiceEnabled, () => {
  describe('Skip The LB Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(lbServiceEnabled, () => {
  describe('The LB Page', () => {
    const listUrl = lbListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-lb-${uuid}`;
    const listener = `e2e-listener-${uuid}`;
    const pool = `e2e-pool-${uuid}`;
    const health = `e2e-health-${uuid}`;

    const listener2 = `e2e-listener2-${uuid}`;
    const pool2 = `e2e-pool2-${uuid}`;

    const port = 55;
    const port2 = 56;
    const networkName = `e2e-network-for-lb-${uuid}`;
    const routerName = `e2e-router-for-lb-${uuid}`;

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createFip();
    });

    it('successfully create lb', () => {
      cy.clickHeaderActionButton(0)
        .wait(5000)
        .formInput('name', name)
        .formText('description', name)
        .formTableSelectBySearch('vip_network_id', networkName)
        .wait(5000)
        .formButtonClick('vip_address')
        .formSelect('vip_address')
        .clickStepActionNextButton();

      cy.formInput('listener_name', listener)
        .formText('listener_description', listener)
        .formSelect('listener_protocol')
        .formInput('listener_protocol_port', port)
        .clickStepActionNextButton();

      cy.formInput('pool_name', pool)
        .formText('pool_description', pool)
        .formSelect('pool_lb_algorithm')
        .formSelect('pool_protocol')
        .clickStepActionNextButton();

      cy.wait(5000).clickStepActionNextButton();

      cy.formInput('health_name', health)
        .formSelect('health_type')
        .clickStepActionNextButton()
        .waitFormLoading()
        .url()
        .should('include', listUrl)
        .closeNotice()
        .wait(5000)
        .tableSearchText(name)
        .waitStatusActiveByRefresh();
    });

    it('successfully detail', () => {
      cy.tableSearchText(name).goToDetail(1, 2000).goBackToList(listUrl);
    });

    it('successfully edit', () => {
      cy.tableSearchText(name)
        .clickFirstActionButton()
        .formText('description', 'description')
        .clickModalActionSubmitButton()
        .waitStatusActiveByRefresh();
    });

    it('successfully associate fip', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Associate Floating IP')
        .formTableSelect('fixed_ip')
        .formTableSelect('fip')
        .clickModalActionSubmitButton()
        .waitStatusActiveByRefresh();
    });

    it('successfully disassociate fip', () => {
      cy.tableSearchText(name)
        .clickConfirmActionInMore('Disassociate Floating IP')
        .waitStatusActiveByRefresh();
    });

    it('successfully create listener', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .clickHeaderActionButton(0)
        .formInput('name', listener2)
        .formText('description', listener2)
        .formSelect('protocol')
        .formInput('protocol_port', port2)
        .clickModalActionSubmitButton();
    });

    it('successfully edit listener', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .clickFirstActionButton()
        .formText('description', 'description')
        .clickModalActionSubmitButton();
    });

    it('successfully edit listener health monitor', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .clickActionInMore('Edit Health Monitor')
        .formRadioChoose('admin_state_up', 1)
        .clickModalActionSubmitButton()
        .tableSearchText(listener)
        .waitStatusActiveByRefresh();
    });

    it('successfully edit listener default pool', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .clickActionInMore('Edit Default Pool')
        .formText('description', 'description')
        .clickModalActionSubmitButton()
        .tableSearchText(listener)
        .waitStatusActiveByRefresh();
    });

    it('successfully delete listener default pool', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .clickConfirmActionInMore('Delete Default Pool')
        .tableSearchText(listener)
        .waitStatusActiveByRefresh();
    });

    it('successfully create listener default pool', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .clickActionInMore('Create Default Pool')
        .formInput('name', pool2)
        .formText('description', pool2)
        .formSelect('lb_algorithm')
        .formSelect('protocol')
        .clickModalActionSubmitButton()
        .tableSearchText(listener)
        .waitStatusActiveByRefresh();
    });

    it('successfully listener detail', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .goToDetail(0, 2000)
        .clickDetailTab('Members', 'members');
    });

    it('successfully create listener member', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .goToDetail(0, 2000)
        .clickDetailTab('Members')
        .clickHeaderActionButton(0)
        .formButtonClick('extMembers')
        .get('.ant-form-item')
        .eq(1)
        .find('.ant-input-number-input')
        .first()
        .type(port2)
        .clickModalActionSubmitButton()
        .waitStatusActiveByRefresh();
    });

    it('successfully edit listener member', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .goToDetail(0, 2000)
        .clickDetailTab('Members')
        .clickFirstActionButton()
        .wait(2000)
        .formInput('weight', 2)
        .clickModalActionSubmitButton()
        .waitStatusActiveByRefresh();
    });

    it('successfully delete listener member', () => {
      cy.tableSearchText(name)
        .goToDetail(1, 2000)
        .tableSearchText(listener)
        .goToDetail(0, 2000)
        .clickDetailTab('Members')
        .clickConfirmActionButton('Delete')
        .goBackToList()
        .tableSearchText(listener)
        .waitStatusActiveByRefresh();
    });

    it('successfully delete', () => {
      cy.tableSearchText(name).clickConfirmActionInMore('Delete');
    });

    it('successfully delete related resources', () => {
      cy.deleteRouter(routerName, networkName);
      cy.deleteAll('network', networkName);
      cy.deleteAll('fip');
    });
  });
});
