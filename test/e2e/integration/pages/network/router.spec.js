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

import { routerListUrl } from '../../../support/constants';

describe('The Router Page', () => {
  const listUrl = routerListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-router-${uuid}`;
  const newname = `${name}-1`;
  const networkName = `e2e-network-router-${uuid}`;

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.createNetwork({ name: networkName });
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0, 5000)
      .formInput('name', name)
      .formText('description', name)
      .formTableSelect('hints')
      .formCheckboxClick('openExternalNetwork')
      .wait(2000)
      .formTableSelect('externalNetwork')
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .checkTableFirstRow(name)
      .goToDetail()
      .checkDetailName(name);
    cy.clickDetailTab('Ports', 'ports').clickDetailTab(
      'Static Routes',
      'staticRoutes'
    );
    // .clickDetailTab('Port Forwardings', 'port_forwarding');
    cy.goBackToList(listUrl);
  });

  it('successfully disable delete', () => {
    cy.checkActionDisabledInFirstRow('Delete', name);
  });

  it('successfully connect subnet and disable delete', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Connect Subnet', 5000)
      .formTableSelectBySearch('network', networkName)
      .wait(5000)
      .formTableSelect('subnet')
      .clickModalActionSubmitButton();
    cy.checkActionDisabledInFirstRow('Delete', name);
  });

  it('successfully port detail', () => {
    cy.tableSearchText(name)
      .checkTableFirstRow(name)
      .goToDetail()
      .checkDetailName(name);
    cy.clickDetailTab('Ports').goToDetail(0);
  });

  it('successfully disconnect subnet and disable delete', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Disconnect Subnet', 5000)
      .formTableSelect('subnet')
      .clickModalActionSubmitButton();
    cy.checkActionDisabledInFirstRow('Delete', name);
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .formText('description', newname)
      .clickModalActionSubmitButton()
      .wait(2000);
  });

  it('successfully close external gateway and delete', () => {
    cy.tableSearchText(newname)
      .clickConfirmActionInMore('Close External Gateway')
      .clickConfirmActionInMore('Delete')
      .tableSearchText(newname)
      .checkEmptyTable();
  });

  it('successfully delete related resources', () => {
    cy.deleteAll('network', networkName);
  });
});
