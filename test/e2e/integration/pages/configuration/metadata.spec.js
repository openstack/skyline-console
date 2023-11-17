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

import { metadataListUrl } from '../../../support/constants';

describe('The Metadata Page', () => {
  const listUrl = metadataListUrl;
  const name = 'An Example Namespace';
  const filename = 'metadata.json';

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formAttachFile('metadata', filename)
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.tableSimpleSearchText(name).checkTableFirstRow(name).goToDetail();
    cy.goBackToList(listUrl);
  });

  it('successfully manage resource type', () => {
    cy.tableSimpleSearchText(name)
      .clickActionInMore('Manage Resource Types')
      .formTableSelectBySearch('associations', 'OS::Cinder::Volume')
      .clickModalActionSubmitButton();
  });

  it('successfully edit', () => {
    cy.tableSimpleSearchText(name)
      .clickFirstActionButton()
      .formCheckboxClick('options', 0)
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSimpleSearchText(name)
      .clickConfirmActionInMore('Delete')
      .checkEmptyTable();
  });
});
