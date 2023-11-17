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

import { keypairListUrl } from '../../../support/constants';

describe('The Keypair Page', () => {
  const listUrl = keypairListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-keypair-${uuid}`;
  const nameByFile = `e2e-keypair-file-${uuid}`;
  const filename = 'keypair';

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .clickModalActionSubmitButton()
      .wait(5000);
  });

  it('successfully create by file', () => {
    cy.clickHeaderActionButton(0)
      .formRadioChoose('type', 1)
      .formInput('name', nameByFile)
      .formAttachFile('public_key', filename)
      .clickModalActionSubmitButton()
      .tableSearchText(nameByFile)
      .checkTableFirstRow(nameByFile);
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .checkTableFirstRow(name)
      .goToDetail()
      .checkDetailName(name);
    cy.goBackToList(listUrl);
  });

  it('successfully delete', () => {
    cy.tableSearchText(name).clickConfirmActionInFirst().checkEmptyTable();
    cy.tableSearchText(nameByFile)
      .clickConfirmActionInFirst()
      .checkEmptyTable();
  });
});
