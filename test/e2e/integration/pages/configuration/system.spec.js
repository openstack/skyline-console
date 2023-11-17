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
import { infoListUrl } from '../../../support/constants';

describe('The System Info Page', () => {
  const listUrl = infoListUrl;
  const reason = 'e2e:disable';
  const computeServicesTab = 'Compute Services';
  const blockStorageServicesTab = 'Block Storage Services';
  const NeutronAgentsTab = 'Neutron Agents';
  const orchestrationServicesTab = 'Orchestration Services';
  const uuid = Cypress._.random(0, 1e6);

  const routerName = `e2e-router-for-neutronAgent-${uuid}`;
  const networkName = `e2e-network-for-neutronAgent-${uuid}`;

  const heatServiceEnabled = (Cypress.env('extensions') || []).includes('heat');

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.login();
    cy.createNetwork({ name: networkName });
    cy.createRouter({ name: routerName });
  });

  it('successfully services', () => {
    cy.tableSimpleSearchText('nova');
  });

  it('successfully compute services', () => {
    cy.clickTab(computeServicesTab, 'computeServices');
  });

  it('successfully disable compute services', () => {
    cy.clickTab(computeServicesTab)
      .tableSearchText('nova-compute')
      .clickActionButtonByTitle('Disable')
      .formText('disabled_reason', reason)
      .clickModalActionSubmitButton();
  });

  it('successfully enable compute services', () => {
    cy.clickTab(computeServicesTab)
      .tableSearchSelect('Service Status', 'Disabled')
      .clickActionButtonByTitle('Enable')
      .clickConfirmActionSubmitButton();
  });

  it('successfully block storage services', () => {
    cy.clickTab(blockStorageServicesTab, 'cinderService');
  });

  it('successfully disable block storage services', () => {
    cy.clickTab(blockStorageServicesTab)
      .clickActionButtonByTitle('Disable')
      .formText('disabled_reason', reason)
      .clickModalActionSubmitButton();
  });

  it('successfully enable block storage services', () => {
    cy.clickTab(blockStorageServicesTab)
      .tableSearchSelect('Service Status', 'Disabled')
      .clickActionButtonByTitle('Enable')
      .clickConfirmActionSubmitButton();
  });

  it('successfully neutron agents', () => {
    cy.clickTab(NeutronAgentsTab, 'neutronAgent');
  });

  it('successfully disable neutron agents', () => {
    cy.clickTab(NeutronAgentsTab)
      .clickActionButtonByTitle('Disable')
      .clickConfirmActionSubmitButton();
  });

  it('successfully enable neutron agents', () => {
    cy.clickTab(NeutronAgentsTab)
      .tableSearchSelect('Service Status', 'Disabled')
      .clickActionButtonByTitle('Enable')
      .clickConfirmActionSubmitButton();
  });

  it('successfully neutron agent detail - l3', () => {
    cy.clickTab(NeutronAgentsTab)
      .tableSearchText('l3')
      .goToDetail(0)
      .clickDetailTab('Routers', 'router');
  });

  it('successfully neutron agent l3 remove router', () => {
    cy.clickTab(NeutronAgentsTab)
      .tableSearchText('l3')
      .goToDetail(0)
      .clickDetailTab('Routers')
      .tableSearchText(routerName)
      .clickActionButtonByTitle('Remove')
      .clickConfirmActionSubmitButton(10000);
  });

  // it('successfully neutron agent l3 add router', () => {
  //   cy.clickTab(NeutronAgentsTab)
  //     .tableSearchText('l3')
  //     .goToDetail(0)
  //     .clickDetailTab('Router')
  //     .clickHeaderActionButton(0)
  //     .wait(10000)
  //     .formTableSelectBySearch('router', routerName)
  //     .clickModalActionSubmitButton();
  // });

  it('successfully neutron agent detail - dhcp', () => {
    cy.clickTab(NeutronAgentsTab)
      .tableSearchText('dhcp')
      .goToDetail(0)
      .clickDetailTab('Networks', 'network');
  });

  it('successfully neutron agent dhcp remove network', () => {
    cy.clickTab(NeutronAgentsTab)
      .tableSearchText('dhcp')
      .goToDetail(0)
      .clickDetailTab('Networks')
      .tableSearchText(networkName)
      .clickActionButtonByTitle('Remove')
      .clickConfirmActionSubmitButton();
  });

  it('successfully neutron agent dhcp add network', () => {
    cy.clickTab(NeutronAgentsTab)
      .tableSearchText('dhcp')
      .goToDetail(0)
      .clickDetailTab('Networks')
      .clickHeaderActionButton(0)
      .wait(5000)
      .formTableSelectBySearch('network', networkName)
      .clickModalActionSubmitButton();
  });

  onlyOn(heatServiceEnabled, () => {
    it('successfully orchestration services', () => {
      cy.clickTab(orchestrationServicesTab, 'heatService');
    });
  });

  it('successfully delete related resources', () => {
    cy.login();
    cy.deleteRouter(routerName);
    cy.deleteAll('network', networkName);
  });
});
