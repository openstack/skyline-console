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

import {
  volumeSnapshotListUrl,
  volumeListUrl,
} from '../../../support/constants';

describe('The Volume Snapshot Page', () => {
  const listUrl = volumeSnapshotListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-snapshot-${uuid}`;
  const volumeName = `e2e-volume-for-snapshot-${uuid}`;
  const volumeNameBySnapshot = `e2e-volume-by-snapshot-${uuid}`;
  const newname = `${name}-1`;

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.createVolume(volumeName);
  });

  it('successfully create', () => {
    cy.visitPage(volumeListUrl)
      .tableSearchText(volumeName)
      .clickActionInMoreSub('Create Snapshot', 'Data Protection')
      .formInput('name', name)
      .clickModalActionSubmitButton();

    cy.visitPage(listUrl).tableSearchText(name).waitStatusActiveByRefresh();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name).goToDetail().checkDetailName(name);
    cy.goBackToList(listUrl);

    cy.visitPage(volumeListUrl)
      .tableSearchText(volumeName)
      .goToDetail()
      .clickDetailTab('Volume Snapshots', 'snapshot')
      .tableSearchText(name)
      .goToDetail();
  });

  it('successfully create volume', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Create Volume')
      .wait(2000)
      .formInput('name', volumeNameBySnapshot)
      .clickModalActionSubmitButton()
      .wait(10000);
    cy.deleteAll('volume', volumeNameBySnapshot);
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(newname).clickConfirmActionInMore('Delete');
  });

  it('successfully delete related resources', () => {
    cy.deleteAll('volume', volumeName);
  });
});
