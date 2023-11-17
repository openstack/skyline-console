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

import { userGroupListUrl } from '../../../support/constants';

describe('The User Group Page', () => {
  const listUrl = userGroupListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-user-group-${uuid}`;
  const newname = `${name}-1`;
  const username = `e2e-user-for-user-group-${uuid}`;

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.createUser({ name: username });
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .checkDetailName(name)
      .clickDetailTab('Sub Users', 'user')
      .clickDetailTab('Subordinate Projects', 'project');
    cy.goBackToList(listUrl);
  });

  it('successfully manage user', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Manage User')
      .formTransfer('select_user', username)
      .formTransferRight('select_user', username)
      .clickModalActionSubmitButton();

    cy.tableSearchText(name).goToDetail().clickDetailTab('Sub Users', 'user');
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
  });
});
