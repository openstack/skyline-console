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

import { securityGroupListUrl } from '../../../support/constants';

describe('The Security Group Page', () => {
  const listUrl = securityGroupListUrl;
  const name = `e2e-security-group-${Cypress._.random(0, 1e6)}`;
  const newname = `${name}-1`;

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .formText('description', name)
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name).goToDetail();
    cy.goBackToList(listUrl);
  });

  it('successfully create rule', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .wait(5000)
      .clickHeaderActionButton(0)
      .formSelect('ethertype')
      .formInput('sourcePort', 80)
      .formInput('remote_ip_prefix', '192.168.0.0/24')
      .clickModalActionSubmitButton();
  });

  it('successfully delete rule', () => {
    cy.tableSearchText(name).goToDetail().clickConfirmActionInFirst();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .formText('description', 'description')
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(newname).clickConfirmActionInMore('Delete');
  });
});
