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

import { recycleBinListUrl, instanceListUrl } from '../../../support/constants';

describe('The Recycle Bin Page', () => {
  const listUrl = recycleBinListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const networkName = `e2e-network-for-recycleBin-${uuid}`;
  const instanceName = `e2e-instance-for-recycleBin-${uuid}`;

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.createNetwork({ name: networkName });
    cy.createInstance({ name: instanceName, networkName });
  });

  it('successfully create', () => {
    cy.visitPage(instanceListUrl)
      .tableSearchText(instanceName)
      .clickConfirmActionInMore('Delete');
  });

  it('successfully detail', () => {
    cy.tableSearchText(instanceName).goToDetail().checkDetailName(instanceName);
    cy.goBackToList(listUrl);
  });

  it('successfully restore', () => {
    cy.tableSearchText(instanceName).clickConfirmActionInFirst().wait(10000);
    cy.tableSearchText(instanceName).checkEmptyTable();
  });

  it('successfully delete', () => {
    cy.visitPage(instanceListUrl)
      .tableSearchText(instanceName)
      .clickConfirmActionInMore('Delete')
      .wait(10000);

    cy.visitPage(listUrl)
      .tableSearchText(instanceName)
      .clickConfirmActionButton('Delete')
      .wait(20000)
      .tableSearchText(instanceName)
      .checkEmptyTable();
  });

  it('successfully delete prepared data', () => {
    cy.deleteAll('network', networkName);
  });
});
