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

import { userListUrl } from '../../../support/constants';

describe('The User Page', () => {
  const listUrl = userListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-user-${uuid}`;
  const newname = `${name}-1`;
  const email = `${name}@example.com`;
  const prefix = '+86';
  const phone = '18500000000';
  const password = 'passW0rd_';
  const tmpPassword = `${password}1`;
  const projectName = `e2e-project-for-user-${uuid}`;
  const projectName2 = `e2e-project2-for-user-${uuid}`;
  const userGroupName = `e2e-ug-for-user-${Cypress._.random(0, 1e3)}`;

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.createProject({ name: projectName });
    cy.createProject({ name: projectName2 });
    cy.createUserGroup({ name: userGroupName });
  });

  it('successfully create', () => {
    const creatUrl = `${listUrl}/create`;

    cy.clickHeaderActionButton(0)
      .url()
      .should('include', creatUrl)
      .formInput('name', name)
      .formInput('email', email)
      .formInput('password', tmpPassword)
      .formInput('confirmPassword', tmpPassword)
      .formSelect('phone', prefix)
      .formInput('phone', phone, '.ant-input')
      .formInput('real_name', name)
      .formButtonClick('more')
      .wait(2000)
      .formTransfer('select_project', projectName)
      .wait(2000)
      .formTransfer('select_user_group', userGroupName)
      .clickFormActionSubmitButton()
      .url()
      .should('include', listUrl)
      .url()
      .should('not.include', creatUrl)
      .tableSearchText(name)
      .waitStatusGreen(8);
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Subordinate User Groups', 'userGroup')
      .clickDetailTab('Subordinate Projects', 'user');
    cy.goBackToList(listUrl);
  });

  it('successfully edit system permission', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Edit System Permission')
      .wait(10000)
      .formSelect('role', 'admin')
      .clickModalActionSubmitButton();
  });

  it('successfully forbidden user', () => {
    cy.tableSearchText(name).clickConfirmActionInMore('Forbidden');
  });

  it('successfully enable user', () => {
    cy.tableSearchText(name).clickConfirmActionInMore('Enable');
  });

  it('successfully login', () => {
    cy.logout();
    cy.loginByPage(name, tmpPassword);
    // .url()
    // .should('include', 'changepassword')
    // .resetFormInput('password', password)
    // .resetFormInput('confirmPassword', password)
    // .resetFormSubmit()
    // .url()
    // .should('include', 'login')
    // .loginByPage(name, password);
  });

  it('successfully update user password', () => {
    const newPassword = `${password}2`;
    cy.tableSearchText(name)
      .clickActionInMore('Update User Password')
      .formInput('password', newPassword)
      .formInput('confirmPassword', newPassword)
      .clickModalActionSubmitButton();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(name).clickConfirmActionInMore('Delete');
  });

  it('successfully delete related resources', () => {
    cy.deleteAll('project', projectName);
    cy.deleteAll('project', projectName2);
    cy.deleteAll('userGroup', userGroupName);
  });
});
