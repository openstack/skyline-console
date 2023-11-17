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

import { volumeTypeListUrl } from '../../../support/constants';

describe('The Volume Type Page', () => {
  const listUrl = volumeTypeListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-volume-type-${uuid}`;
  const newname = `${name}-1`;
  const qosName = `e2e-qos-for-volume-type-${uuid}`;
  const extraKeyName = `e2e-extra-for-volume-type-${uuid}`;

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.clickTab('QoS Specs')
      .clickHeaderActionButton(0)
      .formInput('name', qosName)
      .formSelect('consumer')
      .clickModalActionSubmitButton()
      .waitTableLoading();
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .formText('description', 'create')
      .clickModalActionSubmitButton()
      .waitTableLoading();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name).goToDetail().checkDetailName(name);
    cy.goBackToList(listUrl);
  });

  it('successfully create extra specs', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Extra Specs')
      .wait(5000)
      .clickHeaderActionButton(0)
      .formInput('keyname', extraKeyName)
      .formInput('value', 1000)
      .clickModalActionSubmitButton();
  });

  it('successfully edit extra specs', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Extra Specs')
      .wait(5000)
      .tableSearchText(extraKeyName)
      .clickActionButtonByTitle('Edit')
      .formInput('value', 2000)
      .clickModalActionSubmitButton();
  });

  it('successfully delete extra specs', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Extra Specs')
      .wait(5000)
      .tableSearchText(extraKeyName)
      .clickFirstActionButton()
      .clickConfirmActionSubmitButton();
  });

  it('successfully manage qos', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formTableSelectBySearch('qosSpec', qosName)
      .clickModalActionSubmitButton();
  });

  it('successfully manage access to projects', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Manage Access')
      .formCheckboxClick('isPublic')
      .formTableSelectAll('access')
      .clickModalActionSubmitButton();
  });

  it('successfully manage access to public', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Manage Access')
      .formCheckboxClick('isPublic')
      .clickModalActionSubmitButton();
  });

  it('successfully create encryption', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Create Encryption')
      .formInput('provider', 'luks')
      .formSelect('control_location')
      .clickModalActionSubmitButton();

    cy.tableSearchText(name).goToDetail();
  });

  it('successfully delete encryption', () => {
    cy.tableSearchText(name).clickConfirmActionInMore('Delete Encryption');
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Edit')
      .formInput('name', newname)
      .formText('description', 'edit')
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(newname)
      .clickConfirmActionInMore('Delete')
      .tableSearchText(newname);
  });

  it('successfully delete related resources', () => {
    cy.deleteAll('volumeType', qosName, 'QoS');
  });
});
