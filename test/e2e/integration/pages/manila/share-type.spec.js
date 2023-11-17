// Copyright 2022 99cloud
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

import { onlyOn } from '@cypress/skip-test';
import { shareTypeListUrl } from '../../../support/constants';

const manilaServiceEnabled = (Cypress.env('extensions') || []).includes(
  'manila'
);

onlyOn(!manilaServiceEnabled, () => {
  describe('Skip The Share Type Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(manilaServiceEnabled, () => {
  describe('The Share Type Page', () => {
    const listUrl = shareTypeListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-share-type-${uuid}`;
    const newname = `${name}-1`;
    const extraKeyName = `e2e-extra-for-share-type-${uuid}`;

    beforeEach(() => {
      cy.loginAdmin(listUrl);
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(0)
        .formInput('name', name)
        .formText('description', 'create')
        .formSelect('driver_handles_share_servers')
        .clickModalActionSubmitButton()
        .waitTableLoading();
    });

    it('successfully detail', () => {
      cy.tableSimpleSearchText(name)
        .goToDetail()
        .checkDetailName(name)
        .clickDetailTab('Extra Specs', 'ExtraSpec')
        .clickDetailTab('Shares', 'share');
      cy.goBackToList(listUrl);
    });

    it('successfully create extra specs', () => {
      cy.tableSimpleSearchText(name)
        .goToDetail()
        .clickDetailTab('Extra Specs')
        .wait(5000)
        .clickHeaderActionButton(0)
        .formInput('keyName', extraKeyName)
        .formInput('value', 1000)
        .clickModalActionSubmitButton();
    });

    it('successfully edit extra specs', () => {
      cy.tableSimpleSearchText(name)
        .goToDetail()
        .clickDetailTab('Extra Specs')
        .wait(5000)
        .tableSearchText(extraKeyName)
        .clickActionButtonByTitle('Edit')
        .formInput('value', 2000)
        .clickModalActionSubmitButton();
    });

    it('successfully delete extra specs', () => {
      cy.tableSimpleSearchText(name)
        .goToDetail()
        .clickDetailTab('Extra Specs')
        .wait(5000)
        .tableSearchText(extraKeyName)
        .clickFirstActionButton()
        .clickConfirmActionSubmitButton();
    });

    it('successfully manage access to projects', () => {
      cy.tableSimpleSearchText(name)
        .clickActionInMore('Manage Access')
        .formCheckboxClick('isPublic')
        .formTableSelectAll('access')
        .clickModalActionSubmitButton();
    });

    it('successfully manage access to public', () => {
      cy.tableSimpleSearchText(name)
        .clickActionInMore('Manage Access')
        .formCheckboxClick('isPublic')
        .clickModalActionSubmitButton();
    });

    it('successfully edit', () => {
      cy.tableSimpleSearchText(name)
        .clickFirstActionButton('Edit')
        .formInput('name', newname)
        .formText('description', 'edit')
        .clickModalActionSubmitButton();
    });

    it('successfully delete', () => {
      cy.tableSimpleSearchText(newname)
        .clickConfirmActionInMore('Delete')
        .tableSimpleSearchText(newname)
        .checkEmptyTable();
    });
  });
});
