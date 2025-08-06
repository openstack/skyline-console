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

import { networkListUrl } from '../../../support/constants';

describe('The Network Page', () => {
  const listUrl = networkListUrl;
  const name = `e2e-network-${Cypress._.random(0, 1e6)}`;
  const subnetName = `${name}-subnet`;
  const cidr = `192.168.${Cypress._.random(50, 100)}.0/24`;
  const cidrV6 = `1001:${Cypress._.random(1005, 1100)}::/64`;
  const newname = `${name}-1`;
  const subnetName2 = `${newname}-subnet-2`;

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully fetch List', () => {
    cy.clickTab('Shared Networks', 'sharedNetwork');
    cy.clickTab('External Networks', 'externalNetwork');
    // cy.clickTab('All Network', 'allNetwork');
    cy.clickTab('Current Project Networks', 'projectNetwork');
  });

  it('successfully create with subnet', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .formText('description', name)
      .formSelect('availableZone')
      .formCheckboxClick('create_subnet')
      .formInput('subnet_name', subnetName)
      .formSelect('ip_version')
      .formInput('cidr', cidr)
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .checkTableFirstRow(name)
      .goToDetail()
      .checkDetailName(name);
    cy.clickDetailTab('Subnets', 'subnets').clickDetailTab('Ports', 'ports');
    cy.goBackToList(listUrl);
  });

  it('successfully create subnet', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Create Subnet', 5000)
      .formInput('subnet_name', subnetName2)
      .formSelect('ip_version', 'ipv6')
      .formInput('cidr', cidrV6)
      .clickModalActionSubmitButton();
    cy.tableSearchText(name).checkColumnValue(5, 2);
  });

  it('successfully delete subnet', () => {
    cy.tableSearchText(name).checkTableFirstRow(name).goToDetail();
    cy.clickDetailTab('Subnets');
    cy.tableSearchText(subnetName2).clickConfirmActionButton('Delete');
    cy.wait(10000);
    cy.tableSearchText(subnetName2).checkEmptyTable();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .formText('description', newname)
      .clickModalActionSubmitButton()
      .wait(2000);
  });

  it('successfully delete network', () => {
    cy.tableSearchText(newname)
      .checkTableFirstRow(newname)
      .clickConfirmActionInMore('Delete');
    cy.tableSearchText(newname).checkEmptyTable();
  });
});
