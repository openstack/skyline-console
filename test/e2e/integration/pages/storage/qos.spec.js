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

describe('The Qos Specs Page', () => {
  const listUrl = volumeTypeListUrl;
  const name = `e2e-qos-${Cypress._.random(0, 1e6)}`;

  beforeEach(() => {
    cy.loginAdmin(listUrl).clickTab('QoS Specs');
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .formSelect('consumer')
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
      .wait(5000)
      .clickHeaderActionButton(0)
      .formInput('value', 1000)
      .clickModalActionSubmitButton();
  });

  it('successfully edit extra specs', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .wait(5000)
      .clickActionButtonByTitle('Edit')
      .formInput('value', 2000)
      .clickModalActionSubmitButton();
  });

  it('successfully delete extra specs', () => {
    cy.tableSearchText(name)
      .goToDetail()
      .wait(5000)
      .clickFirstActionButton()
      .clickConfirmActionSubmitButton();
  });

  it('successfully edit consumer', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formSelect('consumer', 'Backend')
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(name)
      .clickActionButtonByTitle('Delete')
      .clickConfirmActionSubmitButton();
  });
});
