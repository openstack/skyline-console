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
import {
  volumeListUrl,
  volumeTypeListUrl,
  imageListUrl,
} from '../../../support/constants';

describe('The Volume Page', () => {
  const listUrl = volumeListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-volume-${uuid}`;
  const newname = `${name}-1`;
  const volumeTypeName = `e2e-volume-type-for-volume-${Cypress._.random(
    0,
    1e6
  )}`;
  const imageName = `e2e-image-by-volume-${uuid}`;
  const snapshotName = `e2e-snapshot-by-volume-${uuid}`;
  const backupName = `e2e-backup-by-volume-${uuid}`;
  const backupIncName = `e2e-backup-inc-by-volume-${uuid}`;
  const cloneVolumeName = `e2e-clone-volume-${uuid}`;

  const networkName = `e2e-network-for-volume-${uuid}`;
  const instanceName = `e2e-instance-for-volume-${uuid}`;
  const skipCreateImage = true;

  const backupServiceEnabled = (Cypress.env('extensions') || []).includes(
    'cinder::backup'
  );

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully prepare resource by admin', () => {
    cy.loginAdmin(volumeTypeListUrl)
      .clickHeaderActionButton(0)
      .formInput('name', volumeTypeName)
      .clickModalActionSubmitButton()
      .waitTableLoading();
  });

  it('successfully prepare resource', () => {
    cy.createNetwork({ name: networkName });
    cy.createInstance({ name: instanceName, networkName });
  });

  it('successfully create', () => {
    const creatUrl = `${listUrl}/create`;
    cy.clickHeaderActionButton(0)
      .url()
      .should('include', creatUrl)
      .wait(5000)
      .formInput('size', 1)
      .formInput('name', name)
      .clickFormActionSubmitButton()
      .wait(2000)
      .url()
      .should('include', listUrl)
      .url()
      .should('not.include', creatUrl)
      .tableSearchText(name)
      .waitStatusActiveByRefresh();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .checkTableFirstRow(name)
      .goToDetail()
      .checkDetailName(name);
    cy.clickDetailTab('Volume Backups', 'backup').clickDetailTab(
      'Volume Snapshots',
      'snapshot'
    );
    cy.goBackToList(listUrl);
  });

  it('successfully create snapshot', () => {
    cy.tableSearchText(name).clickActionInMoreSub(
      'Create Snapshot',
      'Data Protection'
    );
    cy.wait(2000)
      .formInput('name', snapshotName)
      .clickModalActionSubmitButton()
      .tableSearchText(name)
      .waitStatusActive();

    cy.tableSearchText(name)
      .goToDetail()
      .clickDetailTab('Volume Snapshots')
      .tableSearchText(snapshotName)
      .checkTableFirstRow(snapshotName);

    cy.deleteAll('volumeSnapshot', snapshotName);
  });

  onlyOn(backupServiceEnabled, () => {
    it('successfully create backup', () => {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Create Backup', 'Data Protection')
        .formInput('name', backupName)
        .clickModalActionSubmitButton()
        .tableSearchText(name)
        .waitStatusActiveByRefresh();
    });

    it('successfully create backup inc', () => {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Create Backup', 'Data Protection')
        .formInput('name', backupIncName)
        .formRadioChoose('incremental', 1)
        .clickModalActionSubmitButton()
        .tableSearchText(name)
        .waitStatusActive();
      cy.deleteAll('backup', backupIncName);
      cy.wait(5000).deleteAll('backup', backupName);
    });
  });

  it('successfully clone volume', () => {
    cy.tableSearchText(name)
      .clickActionInMoreSub('Clone Volume', 'Data Protection')
      .wait(10000)
      .formInput('name', cloneVolumeName)
      .clickModalActionSubmitButton();
  });

  it('successfully attach', () => {
    cy.tableSearchText(name)
      .clickActionInMoreSub('Attach', 'Instance Related')
      .wait(5000)
      .formTableSelectBySearch('instance', instanceName)
      .clickModalActionSubmitButton()
      .tableSearchText(name)
      .waitStatusTextByFresh('In-use');
  });

  it('successfully detach', () => {
    cy.tableSearchText(name)
      .clickActionInMoreSub('Detach', 'Instance Related')
      .wait(5000)
      .formTableSelect('instance')
      .clickModalActionSubmitButton();
    cy.tableSearchText(name).waitStatusActiveByRefresh();
  });

  it('successfully create image', () => {
    if (!skipCreateImage) {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Create Image', 'Data Protection')
        .formInput('image_name', imageName)
        .clickModalActionSubmitButton();
      cy.tableSearchText(name).waitStatusActiveByRefresh();
      cy.visit(imageListUrl)
        .tableSearchText(imageName)
        .checkTableFirstRow(imageName);
    }
  });

  it('successfully extend volume', () => {
    cy.tableSearchText(name)
      .clickActionInMoreSub('Extend Volume', 'Capacity & Type')
      .clickModalActionSubmitButton();
    cy.tableSearchText(name).waitStatusActiveByRefresh();
  });

  it('successfully change type', () => {
    cy.tableSearchText(name)
      .clickActionInMoreSub('Change Type', 'Capacity & Type')
      .formSelect('new_type')
      .clickModalActionSubmitButton();
    cy.tableSearchText(name).waitStatusActiveByRefresh();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton('Edit')
      .formInput('name', newname)
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(newname).clickConfirmActionInMore('Delete');
  });

  it('successfully delete related resources', () => {
    if (!skipCreateImage) {
      cy.deleteAll('image', imageName);
    }

    cy.deleteAll('volume', cloneVolumeName);
    cy.forceDeleteInstance(instanceName).wait(120000);
    cy.deleteAll('network', networkName);
    // TODO: delete volume type created for this case
    // cy.loginAdmin().wait(10000);
    // cy.deleteAll('volumeType', volumeTypeName);
  });
});
