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

import { aggregateListUrl } from '../../../support/constants';

describe('The Aggregate Page', () => {
  const listUrl = aggregateListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-aggregate-${uuid}`;
  const newname = `${name}-1`;
  const azname = `e2e-az-for-aggre-${uuid}`;

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully create aggregate', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .clickModalActionSubmitButton();
  });

  it('successfully edit az', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formRadioChoose('isCreate', 0)
      .formInput('newAz', azname)
      .clickModalActionSubmitButton();
  });

  it('successfully manage host', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Manage Host')
      .formTableSelectAll('hosts')
      .clickModalActionSubmitButton();
  });

  it('successfully manage metadata', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Manage Metadata')
      .wait(5000)
      .formAddSelectAdd('customs')
      .formInputKeyValue('customs', 'key', 'value')
      .formTransferLeftCheck('systems', 0)
      .clickModalActionSubmitButton();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .clickModalActionSubmitButton();
  });

  it('successfully manage host: no host', () => {
    cy.tableSearchText(newname)
      .clickActionInMore('Manage Host')
      .formTableNotSelectAll('hosts')
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(newname)
      .clickConfirmActionInMore('Delete')
      .checkEmptyTable();
  });

  it('successfully availability zone', () => {
    cy.clickTab('Availability Zones', 'availabilityZone');
  });
});
