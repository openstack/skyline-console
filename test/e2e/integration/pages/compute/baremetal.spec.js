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
import { bareMetalListUrl } from '../../../support/constants';

const ironicServiceEnabled = (Cypress.env('extensions') || []).includes(
  'ironic'
);

onlyOn(!ironicServiceEnabled, () => {
  describe('Skip The Bare Metal Page', () => {
    it('successfully skip', () => {});
  });
});

describe('The Bare Metal Page', () => {
  onlyOn(ironicServiceEnabled, () => {
    const listUrl = bareMetalListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-node-${uuid}`;
    const ip = `10.10.${Cypress._.random(50, 100)}.${Cypress._.random(5, 250)}`;
    const newname = `${name}-1`;
    const username = 'admin';
    const password = 'passW0rd_1';
    const nodeName = 'node-0';
    const portGroupName = `e2e-node-port-group-${uuid}`;
    const macPort = `AD:78:BE:AF:${Cypress._.random(10, 99)}:${Cypress._.random(
      10,
      99
    )}`;
    const macPortGroup = `B1:F1:2D:A8:${Cypress._.random(
      10,
      99
    )}:${Cypress._.random(10, 99)}`;
    const macPort2 = `AD:78:BE:AF:${Cypress._.random(
      10,
      99
    )}:${Cypress._.random(10, 99)}`;
    const macPortGroup2 = `B1:F1:2D:A8:${Cypress._.random(
      10,
      99
    )}:${Cypress._.random(10, 99)}`;

    beforeEach(() => {
      cy.loginAdmin(listUrl);
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(0)
        .wait(2000)
        .formInput('name', name)
        .formSelect('driver')
        .clickStepActionNextButton()
        .wait(2000)
        .formSelect('driver_info_deploy_kernel')
        .formSelect('driver_info_deploy_ramdisk')
        .formInput('driver_info_ipmi_address', ip)
        .formInput('driver_info_ipmi_username', username)
        .formInput('driver_info_ipmi_password', password)
        .clickStepActionNextButton()
        .wait(2000)
        .clickStepActionNextButton()
        .waitFormLoading()
        .url()
        .should('include', listUrl)
        .closeNotice();
    });

    it('successfully detail', () => {
      cy.tableSimpleSearchText(nodeName)
        .checkTableFirstRow(nodeName)
        .goToDetail();
      cy.checkDetailName(nodeName);
      cy.clickDetailTab('Ports', 'ports').clickDetailTab(
        'Port Groups',
        'portGroups'
      );
      cy.goBackToList(listUrl);
    });

    it('successfully power on', () => {
      cy.tableSimpleSearchText('power off')
        .wait(2000)
        .clickConfirmActionInMore('Power On')
        .wait(10000)
        .waitStatusActiveByRefresh();
    });

    it('successfully power off', () => {
      cy.tableSimpleSearchText('power on')
        .wait(2000)
        .clickConfirmActionInMore('Power Off')
        .wait(10000);
    });

    it('successfully auto inspect', () => {
      cy.tableSimpleSearchText(nodeName).clickConfirmActionInMore(
        'Auto Inspect'
      );
    });

    it('successfully enter maintenace mode', () => {
      cy.tableSimpleSearchText(nodeName)
        .clickActionInMore('Enter Maintenance Mode')
        .formText('reason', 'Enter Maintenance Mode')
        .clickModalActionSubmitButton()
        .wait(10000);
    });

    it('successfully leave maintenace mode', () => {
      cy.tableSimpleSearchText(nodeName).clickConfirmActionInMore(
        'Leave Maintenance Mode'
      );
    });

    it('successfully set boot device', () => {
      cy.tableSimpleSearchText(nodeName)
        .clickActionInMore('Set Boot Device')
        .wait(5000)
        .formSelect('boot_device', 'pxe')
        .clickModalActionSubmitButton();
    });

    it('successfully create port group', () => {
      cy.tableSimpleSearchText(name)
        .clickActionInMore('Create Port Group')
        .formInput('name', portGroupName)
        .formInput('address', macPortGroup)
        .clickModalActionSubmitButton()
        .wait(60000);
    });

    it('successfully create port', () => {
      cy.tableSimpleSearchText(name)
        .clickActionInMore('Create Port')
        .wait(5000)
        .formInput('address', macPort)
        .clickModalActionSubmitButton()
        .wait(60000);
    });

    it('successfully edit port', () => {
      cy.tableSimpleSearchText(name)
        .goToDetail()
        .clickDetailTab('Ports')
        .clickFirstActionButton()
        .formInput('address', macPort2)
        .clickModalActionSubmitButton()
        .wait(60000);
    });

    it('successfully delete port', () => {
      cy.tableSimpleSearchText(name)
        .goToDetail()
        .clickDetailTab('Ports')
        .clickConfirmActionButton('Delete')
        .wait(60000);
    });

    it('successfully edit port group', () => {
      cy.tableSimpleSearchText(name)
        .goToDetail()
        .clickDetailTab('Port Groups')
        .clickFirstActionButton()
        .formInput('address', macPortGroup2)
        .clickModalActionSubmitButton()
        .wait(60000);
    });

    it('successfully delete port group', () => {
      cy.tableSimpleSearchText(name)
        .goToDetail()
        .clickDetailTab('Port Groups')
        .clickConfirmActionButton('Delete')
        .wait(60000);
    });

    it('successfully edit', () => {
      cy.tableSimpleSearchText(name)
        .clickActionInMore('Edit')
        .wait(2000)
        .formInput('name', newname)
        .clickStepActionNextButton()
        .wait(2000)
        .clickStepActionNextButton()
        .wait(2000)
        .clickStepActionNextButton()
        .waitFormLoading()
        .wait(60000);
    });

    it('successfully delete', () => {
      cy.tableSimpleSearchText(newname).clickConfirmActionInMore('Delete');
    });

    it('successfully manage state', () => {
      cy.tableSimpleSearchText(nodeName)
        .clickFirstActionButton()
        .formSelect('target')
        .clickModalActionSubmitButton();
    });
  });
});
