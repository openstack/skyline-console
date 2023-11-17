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
  imageListUrl,
  volumeListUrl,
  imageListUrlAdmin,
} from '../../../support/constants';

describe('The Image Page', () => {
  const listUrl = imageListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-image-${uuid}`;
  const sharedImage = `e2e-image-shared-${uuid}`;
  const newname = `${name}-1`;
  const volumeName = `e2e-volume-by-image-${uuid}`;
  const downloadUrl = Cypress.env('imageDownloadUrl');
  const imageFile = Cypress.env('imageFile');
  const filename = imageFile || `cirros-disk-${uuid}.qcow2`;
  const projectName = `e2e-project-for-image-${uuid}`;

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.loginAdmin();
    cy.createProject({ name: projectName });
  });

  onlyOn(!imageFile, () => {
    it('successfully download image', () => {
      cy.downloadFile(downloadUrl, 'test/e2e/fixtures', filename);
      cy.wait(120000);
    });
  });

  it('successfully list', () => {
    cy.clickTab('Public Images', 'public').clickTab('Shared Images', 'shared');
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .url()
      .should('include', `${listUrl}/create`)
      .formInput('name', name)
      .formAttachFile('file', filename)
      .formSelect('disk_format', 'QCOW2 - QEMU image format')
      .formSelect('os_distro', 'Others')
      .formInput('os_version', 'cirros')
      .formInput('os_admin_user', 'root')
      .formSelect('usage_type', 'Common Server')
      .formText('description', name)
      .clickFormActionSubmitButton()
      .wait(2000)
      .url()
      .should('include', listUrl)
      .tableSearchText(name)
      .waitStatusActiveByRefresh();
  });

  it('successfully create shared image by admin', () => {
    cy.loginAdmin(imageListUrlAdmin)
      .wait(2000)
      .clickHeaderActionButton(0)
      .wait(5000)
      .formInput('name', sharedImage)
      .formTableSelectBySearch('owner', projectName)
      .formAttachFile('file', filename)
      .formSelect('disk_format', 'QCOW2 - QEMU image format')
      .formSelect('os_distro', 'Others')
      .formInput('os_version', 'cirros')
      .formInput('os_admin_user', 'root')
      .formSelect('usage_type', 'Common Server')
      .formText('description', sharedImage)
      .formRadioChoose('visibility', 2)
      .wait(2000)
      .formTableSelectBySearch('members', 'e2e')
      .clickFormActionSubmitButton()
      .wait(2000)
      .tableSearchText(sharedImage)
      .waitStatusActiveByRefresh();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name).goToDetail();
    cy.checkDetailName(name);
    cy.goBackToList(listUrl);
  });

  it('successfully create instance with cancel', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Create Instance')
      .wait(2000)
      .clickStepActionCancelButton();
  });

  it('successfully create volume', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Create Volume')
      .formInput('name', volumeName)
      .formSelect('volume_type')
      .clickModalActionSubmitButton();

    cy.visit(volumeListUrl)
      .tableSearchText(volumeName)
      .waitStatusActiveByRefresh()
      .selectAll()
      .clickHeaderConfirmButtonByTitle('Delete');
  });

  it('successfully manage metadata', () => {
    cy.loginAdmin(imageListUrlAdmin);
    cy.tableSearchText(name)
      .clickActionInMore('Manage Metadata')
      .wait(5000)
      .formTransferLeftCheck('systems', 0)
      .clickModalActionSubmitButton();
  });

  it('successfully manage access', () => {
    cy.loginAdmin(imageListUrlAdmin);
    cy.tableSearchText(sharedImage)
      .clickActionInMore('Manage Access')
      .wait(5000)
      .formTableSelectAll('members')
      .clickModalActionSubmitButton();
  });

  it('successfully edit', () => {
    cy.tableSearchText(name)
      .clickFirstActionButton()
      .formInput('name', newname)
      .formText('description', 'description')
      .clickModalActionSubmitButton();
  });

  it('successfully delete', () => {
    cy.tableSearchText(newname).clickConfirmActionInMore('Delete');
    cy.loginAdmin()
      .visitPage(imageListUrlAdmin)
      .tableSearchText(sharedImage)
      .clickConfirmActionInMore('Delete');
  });

  it('successfully delete related resources', () => {
    cy.loginAdmin().deleteAll('project', projectName);
  });
});
