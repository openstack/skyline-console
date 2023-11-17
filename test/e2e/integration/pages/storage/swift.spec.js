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

import { onlyOn } from '@cypress/skip-test';
import { containerListUrl } from '../../../support/constants';

const swiftEnabled = (Cypress.env('extensions') || []).includes('swift');

onlyOn(!swiftEnabled, () => {
  describe('Skip The Swift Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(swiftEnabled, () => {
  describe('The Swift Container Page', () => {
    const listUrl = containerListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-container-${uuid}`;
    const name2 = `e2e-container2-${uuid}`;
    const folderName = `e2e-flolder-${uuid}`;
    const folderName2 = `e2e-flolder2-${uuid}`;
    const filename = `container-file.png`;
    const filename2 = `container-file2.png`;

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully create container', () => {
      cy.clickHeaderActionButton(0)
        .formInput('name', name)
        .clickModalActionSubmitButton();

      cy.clickHeaderActionButton(0)
        .formInput('name', name2)
        .clickModalActionSubmitButton();
    });

    it('successfully update container access', () => {
      cy.tableSearchText(name)
        .clickFirstActionButton()
        .wait(5000)
        .formSwitch('isPublic')
        .clickModalActionSubmitButton();
    });

    it('successfully create folder', () => {
      cy.tableSearchText(name).goToContainerDetail();
      cy.clickHeaderActionButton(0)
        .formInput('folder_name', folderName)
        .clickModalActionSubmitButton();
      cy.clickHeaderActionButton(0)
        .formInput('folder_name', folderName2)
        .clickModalActionSubmitButton();
    });

    it('successfully upload file in container', () => {
      cy.tableSearchText(name)
        .goToContainerDetail()
        .clickHeaderActionButton(2)
        .formAttachFile('file', filename)
        .clickModalActionSubmitButton();
    });

    it('successfully download file', () => {
      cy.tableSearchText(name).goToContainerDetail().tableSearchText(filename);
      cy.clickConfirmActionInMore('Download File');
    });

    it('successfully copy file to folder', () => {
      cy.tableSearchText(name).goToContainerDetail();
      cy.tableSearchText(filename).clickConfirmActionInMore('Copy');

      cy.clickBreadcrumbLink()
        .waitTableLoading()
        .tableSearchText(name)
        .goToContainerDetail()
        .tableSearchText(folderName)
        .goToContainerDetail()
        .clickHeaderConfirmButtonByTitle('Paste');
    });

    it('successfully cut file from folder to folder', () => {
      cy.tableSearchText(name)
        .goToContainerDetail()
        .tableSearchText(folderName)
        .goToContainerDetail()
        .tableSearchText(filename)
        .clickConfirmActionInMore('Cut');

      cy.clickBreadcrumbLink()
        .waitTableLoading()
        .tableSearchText(name)
        .goToContainerDetail()
        .tableSearchText(folderName2)
        .goToContainerDetail()
        .clickHeaderConfirmButtonByTitle('Paste');
    });

    it('successfully rename file in container', () => {
      cy.tableSearchText(name)
        .goToContainerDetail()
        .tableSearchText(filename)
        .clickActionInMore('Rename')
        .formInput('newname', filename2)
        .clickModalActionSubmitButton();
    });

    it('successfully cut file from container to container', () => {
      cy.tableSearchText(name)
        .goToContainerDetail()
        .tableSearchText(filename2)
        .clickConfirmActionInMore('Cut');

      cy.clickBreadcrumbLink()
        .waitTableLoading()
        .tableSearchText(name2)
        .goToContainerDetail()
        .clickHeaderConfirmButtonByTitle('Paste');
    });

    it('successfully delete file in container', () => {
      cy.tableSearchText(name2)
        .goToContainerDetail()
        .tableSearchText(filename2)
        .clickConfirmActionInFirst();
    });

    it('successfully delete file in folder', () => {
      cy.tableSearchText(name)
        .goToContainerDetail()
        .tableSearchText(folderName2)
        .goToDetail()
        .tableSearchText(filename)
        .clickConfirmActionInFirst();
    });

    it('successfully delete folder', () => {
      cy.tableSearchText(name)
        .goToContainerDetail()
        .tableSearchText(folderName)
        .clickConfirmActionInFirst();
      cy.tableSearchText(folderName2).clickConfirmActionInFirst();
    });

    it('successfully delete container', () => {
      cy.tableSearchText(name).clickConfirmActionButton('Delete');
      cy.tableSearchText(name2).clickConfirmActionButton('Delete');
    });
  });
});
