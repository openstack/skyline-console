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

import { serverGroupListUrl } from '../../../support/constants';

describe('The Server Group Page', () => {
  const listUrl = serverGroupListUrl;
  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e-server-group-${uuid}`;
  const instanceName = `e2e-instance-by-server-group-${uuid}`;
  const networkName = `e2e-network-for-server-group-${uuid}`;
  const imageName = Cypress.env('imageName');
  const imageType = Cypress.env('imageType');

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully prepare resource', () => {
    cy.createNetwork({ name: networkName });
  });

  it('successfully create', () => {
    cy.clickHeaderActionButton(0)
      .formInput('name', name)
      .formSelect('policy')
      .clickModalActionSubmitButton();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name)
      .checkTableFirstRow(name)
      .goToDetail()
      .checkDetailName(name);
    cy.goBackToList(listUrl);
  });

  it('successfully create instance', () => {
    const password = 'passW0rd_1';
    cy.tableSearchText(name)
      .goToDetail()
      .clickHeaderActionButton(0)
      .formTableSelect('flavor')
      .formRadioChooseByLabel('image', imageType)
      .formTableSelectBySearch('image', imageName)
      .formSelect('systemDisk')
      .clickStepActionNextButton()
      .wait(5000)
      .formTableSelectBySearch('networkSelect', networkName)
      .formTableSelectBySearch('securityGroup', 'default')
      .clickStepActionNextButton()
      .formInput('name', instanceName)
      .formRadioChoose('loginType', 1)
      .formInput('username', 'root')
      .formInput('password', password)
      .formInput('confirmPassword', password)
      .clickStepActionNextButton()
      .wait(2000)
      .clickStepActionNextButton()
      .waitFormLoading()
      .closeNotice();

    cy.visitPage(listUrl)
      .tableSearchText(name)
      .goToDetail()
      .tableSearchText(instanceName)
      .checkTableFirstRow(instanceName);
  });

  it('successfully delete', () => {
    cy.tableSearchText(name).clickFirstActionDisabled();
    cy.forceDeleteInstance(instanceName);
    cy.wait(60000);
    cy.visitPage(listUrl)
      .tableSearchText(name)
      .clickConfirmActionInFirst()
      .checkEmptyTable();
  });

  it('successfully delete related resources', () => {
    cy.deleteAll('network', networkName);
  });
});
