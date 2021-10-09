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

import { settingUrl, flavorListUrl } from '../../../support/constants';

describe('The Setting Page', () => {
  const listUrl = settingUrl;
  const name = 'flavor_families';
  const filename = 'flavor-family.json';

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully view', () => {
    cy.tableSimpleSearchText(name)
      .clickFirstActionButton()
      .clickConfirmButtonInModal();
  });

  it('successfully edit', () => {
    cy.fixture(filename).then((data) => {
      cy.tableSimpleSearchText(name)
        .clickActionInMore('Edit')
        .formJsonInput('value', data)
        .wait(10000)
        .clickModalActionSubmitButton();

      cy.visitPage(flavorListUrl)
        .clickTab('Custom', 'custom')
        .clickTab('Heterogeneous Computing', 'heterogeneous_computing')
        .clickTab('ARM Architecture', 'arm_architecture')
        .clickTab('X86 Architecture', 'x86_architecture')
        .clickTab('Bare Metal', 'bare_metal');
    });
  });

  it('successfully reset', () => {
    cy.tableSimpleSearchText(name).clickConfirmActionInMore(
      'Reset To Initial Value'
    );
  });
});
