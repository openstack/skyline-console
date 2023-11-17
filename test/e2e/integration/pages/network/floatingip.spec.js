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
import { fipListUrl, instanceListUrl } from '../../../support/constants';

describe('The Floating IP Page', () => {
  const listUrl = fipListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const policyName = `e2e-policy-for-fip-${uuid}`;
  const networkName = `e2e-network-for-fip-${uuid}`;
  const instanceName = `e2e-instance-for-fip-${uuid}`;
  const routerName = `e2e-router-for-fip-${uuid}`;
  const qosServiceEnabled = (Cypress.env('extensions') || []).includes(
    'neutron::qos'
  );

  beforeEach(() => {
    cy.login(listUrl);
  });

  onlyOn(qosServiceEnabled, () => {
    it('successfully prepare resource by admin', () => {
      cy.loginAdmin().wait(5000).createNetworkPolicy({ name: policyName });
    });
  });

  it('successfully prepare resource', () => {
    cy.createNetwork({ name: networkName });
    cy.createRouter({ name: routerName, network: networkName });
    cy.createInstance({ name: instanceName, networkName });
  });

  it('successfully create', () => {
    cy.wait(2000);
    cy.intercept('GET', '/networks').as('networks');
    cy.clickHeaderActionButton(0)
      .wait('@networks')
      .formSelect('floating_network_id')
      .clickModalActionSubmitButton();
  });

  it('successfully batch create', () => {
    cy.wait(2000);
    cy.intercept('GET', '/networks').as('networks');
    cy.clickHeaderActionButton(0)
      .wait('@networks')
      .formSelect('floating_network_id')
      .formCheckboxClick('batch_allocate')
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.goToDetail();
    cy.goBackToList(listUrl);
  });

  it('successfully associate instance', () => {
    cy.tableSearchSelect('Status', 'Down')
      .clickActionInMore('Associate')
      .wait(5000)
      .formTableSelectBySearch('instance', instanceName)
      .wait(5000)
      .formTableSelect('port')
      .clickModalActionSubmitButton();
  });

  it('successfully disassociate', () => {
    cy.tableSearchSelect('Status', 'Active').goToDetail();

    cy.visitPage(instanceListUrl)
      .tableSearchText(instanceName)
      .goToDetail()
      .clickDetailTab('Floating IPs')
      .wait(5000);

    cy.visitPage(listUrl)
      .tableSearchSelect('Status', 'Active')
      .clickConfirmActionInMore('Disassociate');
  });

  // onlyOn(!qosServiceEnabled, () => {
  //   it('successfully edit', () => {
  //     cy.clickFirstActionButton()
  //       .formText('description', 'description')
  //       .clickModalActionSubmitButton()
  //       .wait(2000);
  //   });
  // });

  onlyOn(qosServiceEnabled, () => {
    it('successfully edit', () => {
      cy.clickFirstActionButton()
        .formText('description', 'description')
        .formTabClick('qos_policy_id', 1)
        .wait(5000)
        .formTableSelectBySearch('qos_policy_id', policyName)
        .clickModalActionSubmitButton()
        .wait(2000);
    });
  });

  it('successfully delete', () => {
    cy.tableSearchSelect('Status', 'Down')
      .selectAll()
      .clickHeaderConfirmButtonByTitle('Release');
  });

  it('successfully delete related resources', () => {
    cy.forceDeleteInstance(instanceName);
    cy.deleteRouter(routerName, networkName);
    cy.deleteAll('network', networkName);
    cy.loginAdmin().wait(5000);
    onlyOn(qosServiceEnabled, () => {
      cy.deleteAll('networkQosPolicy', policyName);
    });
  });
});
