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
import { instanceListUrl } from '../../../support/constants';

const ironicServiceEnabled = (Cypress.env('extensions') || []).includes(
  'ironic'
);

onlyOn(!ironicServiceEnabled, () => {
  describe('Skip The Ironic Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(ironicServiceEnabled, () => {
  describe('The Ironic Page', () => {
    const listUrl = instanceListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-ironic-${uuid}`;
    const newname = `${name}-1`;
    const password = 'passW0rd_1';
    const flavorName = `e2e-flavor-for-ironic-${uuid}`;
    const networkName = `e2e-network-for-ironic-${uuid}`;
    const routerName = `e2e-router-for-ironic-${uuid}`;
    const imageName = Cypress.env('imageName');
    const imageType = Cypress.env('imageType');

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully prepare resource by admin', () => {
      cy.loginAdmin().createIronicFlavor(flavorName);
    });

    it('successfully prepare resource', () => {
      cy.createNetwork({ name: networkName });
      cy.createRouter({ name: routerName, network: networkName });
      cy.createFip();
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(2)
        .wait(5000)
        .formTableSelect('flavor')
        .formRadioChooseByLabel('image', imageType)
        .formTableSelectBySearch('image', imageName)
        .clickStepActionNextButton()
        .wait(5000)
        .formTableSelectBySearch('networkSelect', networkName)
        .formTableSelectBySearch('securityGroup', 'default')
        .wait(2000)
        .clickStepActionNextButton()
        .formInput('name', name)
        .formRadioChoose('loginType', 1)
        .formInput('username', 'root')
        .formInput('password', password)
        .formInput('confirmPassword', password)
        .wait(2000)
        .clickStepActionNextButton()
        .wait(2000)
        .clickStepActionNextButton()
        .waitFormLoading()
        .url()
        .should('include', listUrl)
        .closeNotice()
        .waitStatusActiveByRefresh();
    });

    it('successfully detail', () => {
      cy.tableSearchText(name).checkTableFirstRow(name).goToDetail();
      cy.checkDetailName(name);
      cy.clickDetailTab('Interfaces', 'interface')
        .clickDetailTab('Floating IPs', 'floatingIps')
        .clickDetailTab('Security Groups', 'securityGroup');
      cy.goBackToList(listUrl);
    });

    it('successfully lock', () => {
      cy.tableSearchText(name)
        .clickConfirmActionInMoreSub('Lock', 'Instance Status')
        .wait(10000);
    });

    it('successfully unlock', () => {
      cy.tableSearchText(name)
        .clickConfirmActionInMoreSub('Unlock', 'Instance Status')
        .wait(10000);
    });

    it('successfully stop', () => {
      cy.tableSearchText(name)
        .clickConfirmActionInMoreSub('Stop', 'Instance Status')
        .wait(10000)
        .tableSearchText(name)
        .checkColumnValue(6, 'Shutoff')
        .selectFirst()
        .clickHeaderActionButtonByTitle('Stop')
        .checkDisableAction(2000);
    });

    it('successfully start', () => {
      cy.tableSearchText(name)
        .clickConfirmActionInMoreSub('Start', 'Instance Status')
        .waitStatusActive()
        .checkColumnValue(6, 'Active')
        .selectFirst()
        .clickHeaderActionButtonByTitle('Start')
        .checkDisableAction(2000);
    });

    it('successfully reboot', () => {
      cy.tableSearchText(name)
        .clickConfirmActionInMoreSub('Reboot', 'Instance Status')
        .tableSearchText(name)
        .waitStatusActiveByRefresh();
    });

    it('successfully attach interface', () => {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Attach Interface', 'Related Resources')
        .wait(5000)
        .formTableSelect('network')
        .clickModalActionSubmitButton();
    });

    it('successfully detach interface', () => {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Detach Interface', 'Related Resources')
        .wait(5000)
        .formTableSelect('interfaces')
        .clickModalActionSubmitButton();
    });

    it('successfully associate floating IP', () => {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Associate Floating IP', 'Related Resources')
        .wait(5000)
        .formTableSelect('fixed_ip')
        .wait(5000)
        .formTableSelect('fip')
        .clickModalActionCancelButton();
    });

    it('successfully disassociate floating ip', () => {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Disassociate Floating Ip', 'Related Resources')
        .wait(5000)
        .formSelect('address')
        .clickModalActionCancelButton();
    });

    it('successfully manage security group with cancel', () => {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Manage Security Group', 'Related Resources')
        .wait(5000)
        .formTableSelect('port')
        .wait(5000)
        .clickModalActionCancelButton();
    });

    it('successfully rebuild ironic', () => {
      cy.tableSearchText(name)
        .clickActionInMoreSub('Rebuild Instance', 'Configuration Update')
        .wait(5000)
        .formTableSelect('image')
        .clickModalActionSubmitButton()
        .waitStatusActiveByRefresh();
    });

    it('successfully edit', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Edit')
        .formInput('name', newname)
        .clickModalActionSubmitButton()
        .wait(2000);
    });

    it('successfully delete', () => {
      cy.tableSearchText(name).clickConfirmActionInMore('Delete');
    });

    it('successfully delete related resources', () => {
      cy.deleteAll('fip');
      cy.deleteRouter(routerName, networkName);
      cy.deleteAll('network', networkName);
      cy.loginAdmin().deleteAll('flavor', flavorName, 'Bare Metal');
    });
  });
});
