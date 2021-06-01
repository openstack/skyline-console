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

import { hypervisorListUrl } from '../../../support/constants';

describe('The Hypervisor Page', () => {
  const listUrl = hypervisorListUrl;

  beforeEach(() => {
    cy.loginAdmin(listUrl);
  });

  it('successfully list', () => {
    cy.tableSearchText('node');
  });

  it('successfully detail', () => {
    cy.goToDetail(0).wait(5000).goBackToList(listUrl);
  });

  it('successfully compute host', () => {
    cy.clickTab('Compute Hosts', 'ComputeHost').tableSearchText('node');
  });

  it('successfully disable compute host', () => {
    cy.clickTab('Compute Hosts')
      .clickActionButtonByTitle('Disable')
      .formText('disabled_reason', 'e2e-test')
      .clickModalActionSubmitButton();
  });

  it('successfully enable compute host', () => {
    cy.clickTab('Compute Hosts')
      .tableSearchSelect('Service Status', 'Disabled')
      .clickActionButtonByTitle('Enable')
      .clickConfirmActionSubmitButton();
  });
});
