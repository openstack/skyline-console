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

import { flavorListUrl } from '../../../support/constants';

describe('The Flavor Page', () => {
  const listUrl = flavorListUrl;
  const name = `e2e-flavor-${Cypress._.random(0, 1e6)}`;

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully list', () => {
    cy.setAllFlavorType();
    cy.visitPage(listUrl);
    cy.clickTab('Custom', 'custom')
      .clickTab('Heterogeneous Computing', 'heterogeneous_computing')
      .clickTab('Bare Metal', 'bare_metal');
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .wait(2000)
      .formRadioChoose('architecture', 1)
      .formRadioChoose('category', 0)
      .formRadioChoose('architecture', 0)
      .formRadioChoose('category', 0)
      .formInput('name', name)
      .clickStepActionNextButton()
      .wait(2000)
      .formRadioChoose('accessType', 1)
      .formTableSelectAll('accessControl')
      .clickStepActionNextButton();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .checkTableFirstRow(name)
      .goToDetail()
      .checkDetailName(name)
      .clickDetailTab('Instances', 'members');
    cy.goBackToList(listUrl);
  });

  it('successfully manage access', () => {
    cy.tableSearchText(name)
      .clickActionButtonByTitle('Manage Access')
      .wait(5000)
      .formTableSelect('access')
      .clickModalActionSubmitButton();
  });

  it('successfully manage metadata', () => {
    cy.clickTab('Custom')
      .clickActionButtonByTitle('Manage Metadata')
      .wait(5000)
      .formTransferLeftCheck('systems', 0)
      .clickModalActionSubmitButton();

    // todo: remove key-value metadata
    cy.clickTab('Custom')
      .clickActionButtonByTitle('Manage Metadata')
      .wait(5000)
      .formTransferRightCheck('systems', 0)
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(name).clickConfirmActionInFirst();
  });
});
