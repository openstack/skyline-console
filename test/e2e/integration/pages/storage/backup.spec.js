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
import { backupListUrl, volumeListUrl } from '../../../support/constants';

const backupServiceEnabled = (Cypress.env('extensions') || []).includes(
  'cinder::backup'
);

onlyOn(!backupServiceEnabled, () => {
  describe('Skip The Volume Backup Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(backupServiceEnabled, () => {
  describe('The Volume Backup Page', () => {
    const listUrl = backupListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-backup-${uuid}`;
    const nameInc = `${name}-inc`;
    const volumeName = `e2e-volume-for-backup-${uuid}`;
    const volumeNameByBackup = `e2e-volume-by-backup-${uuid}`;
    const newname = `${name}-1`;

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully prepare resource', () => {
      cy.createVolume(volumeName);
    });

    it('successfully create full backup', () => {
      cy.clickHeaderActionButton(0, 5000)
        .formInput('name', name)
        .formTableSelectBySearch('volume', volumeName)
        .clickModalActionSubmitButton()
        .wait(5000)
        .waitTableLoading();
      cy.tableSearchText(name).waitStatusTextByFresh('Available');
    });

    it('successfully create increment backup', () => {
      cy.clickHeaderActionButton(0, 5000)
        .formInput('name', nameInc)
        .formRadioChoose('incremental', 1)
        .formTableSelectBySearch('volume', volumeName)
        .clickModalActionSubmitButton()
        .wait(5000)
        .waitTableLoading();
      cy.tableSearchText(nameInc).waitStatusTextByFresh('Available');
    });

    it('successfully detail', () => {
      cy.tableSearchText(name).goToDetail().checkDetailName(name);
      cy.goBackToList(listUrl);

      cy.visitPage(volumeListUrl)
        .tableSearchText(volumeName)
        .goToDetail()
        .clickDetailTab('Volume Backups', 'backup')
        .tableSearchText(name)
        .goToDetail();
    });

    it('successfully restore by backup', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Restore Backup')
        .wait(5000)
        .formTableSelect('backup')
        .clickModalActionSubmitButton()
        .wait(30000);
    });

    it('successfully create volume by backup', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Create Volume')
        .wait(5000)
        .formInput('name', volumeNameByBackup)
        .formSelect('volume_type')
        .formSelect('availability_zone')
        .clickModalActionSubmitButton();
    });

    it('successfully edit', () => {
      cy.tableSearchText(name)
        .clickFirstActionButton()
        .formInput('name', newname)
        .clickModalActionSubmitButton()
        .wait(2000);
    });

    it('successfully delete', () => {
      cy.tableSearchText(newname)
        .clickConfirmActionInMore('Delete')
        .tableSearchText(newname);
    });

    it('successfully delete related resources', () => {
      cy.deleteAll('volume', volumeName);
      cy.deleteAll('volume', volumeNameByBackup);
    });
  });
});
