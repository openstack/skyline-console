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

import { projectListUrl } from '../../../support/constants';

describe('The Project Page', () => {
  const listUrl = projectListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-project-${uuid}`;
  const newname = `${name}-1`;
  const username = `e2e-user-for-project-${uuid}`;
  const userGroupName = `e2e-ug-for-p-${Cypress._.random(0, 1e3)}`;

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.createUser({ name: username });
    cy.createUserGroup({ name: userGroupName });
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .clickModalActionSubmitButton()
      .waitTableLoading();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .checkDetailName(name)
      .clickDetailTab('Project User Groups', 'userGroup')
      .clickDetailTab('Project Quota', 'quota');
    cy.goBackToList(listUrl);
  });

  it('successfully edit quota', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Edit Quota')
      .wait(5000)
      .formInput('instances', 11)
      .formButtonClick('more')
      .wait(2000)
      .formButtonClick('more')
      .clickModalActionSubmitButton();
  });

  it('successfully manage user', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Manage User')
      .wait(10000)
      .formTransfer('select_user', username)
      .clickModalActionSubmitButton();
  });

  it('successfully manage user group', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Manage User Group')
      .formTransfer('select_group', userGroupName)
      .clickModalActionSubmitButton();
  });

  it('successfully forbidden project', () => {
    cy.tableSearchText(name).clickConfirmActionInMore('Forbidden');
  });

  it('successfully enable project', () => {
    cy.tableSearchText(name).clickConfirmActionInMore('Enable');
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(newname).clickConfirmActionInMore('Delete');
  });

  it('successfully delete related resources', () => {
    cy.deleteAll('user', username);
    cy.deleteAll('userGroup', userGroupName);
  });
});
