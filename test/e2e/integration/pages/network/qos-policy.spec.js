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
import { policyListUrl } from '../../../support/constants';

const qosServiceEnabled = (Cypress.env('extensions') || []).includes(
  'neutron::qos'
);

onlyOn(!qosServiceEnabled, () => {
  describe('Skip The Network Qos Policy Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(qosServiceEnabled, () => {
  describe('The Network Qos Policy Page', () => {
    const listUrl = policyListUrl;
    const name = `e2e-policy-${Cypress._.random(0, 1e6)}`;
    const newname = `${name}-1`;

    beforeEach(() => {
      cy.loginAdmin(listUrl);
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(0)
        .wait(2000)
        .formInput('name', name)
        .formText('description', name)
        // .formSelect('project_id', 'admin')
        .formSwitch('shared')
        .clickModalActionSubmitButton();
    });

    it('successfully detail', () => {
      cy.tableSearchText(name)
        .checkTableFirstRow(name)
        .goToDetail()
        .checkDetailName(name);
      cy.goBackToList(listUrl);
    });

    // egress
    it('successfully create egress bandwidth limit rule', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Create Bandwidth Limit Rule')
        .formSelect('direction', 'egress')
        .clickModalActionSubmitButton();
    });

    it('successfully edit bandwidth egress limit rule', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Edit Bandwidth Egress Limit Rule')
        .formInput('max_kbps', 2)
        .clickModalActionSubmitButton();
    });

    it('successfully delete bandwidth egress limit rule', () => {
      cy.tableSearchText(name).clickConfirmActionInMore(
        'Delete Bandwidth Egress Rules'
      );
    });

    it('successfully create bandwidth ingress limit rule', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Create Bandwidth Limit Rule')
        .formSelect('direction', 'ingress')
        .clickModalActionSubmitButton();
    });

    it('successfully edit bandwidth ingress limit rule', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Edit Bandwidth Ingress Limit Rule')
        .formInput('max_kbps', 2)
        .clickModalActionSubmitButton();
    });

    it('successfully delete bandwidth ingress limit rule', () => {
      cy.tableSearchText(name).clickConfirmActionInMore(
        'Delete Bandwidth Ingress Rules'
      );
    });

    it('successfully create DSCP marking rule', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Create DSCP Marking Rule')
        .clickModalActionSubmitButton();
    });

    it('successfully edit DSCP marking rule', () => {
      cy.tableSearchText(name)
        .clickActionInMore('Edit DSCP Marking Rule')
        .formSelect('dscp_mark', 8)
        .clickModalActionSubmitButton();
    });

    it('successfully delete DSCP marking rule', () => {
      cy.tableSearchText(name).clickConfirmActionInMore(
        'Delete DSCP Marking Rules'
      );
    });

    it('successfully edit', () => {
      cy.tableSearchText(name)
        .clickFirstActionButton()
        .formInput('name', newname)
        .formText('description', newname)
        .clickModalActionSubmitButton()
        .wait(2000);
    });

    it('successfully delete', () => {
      cy.tableSearchText(newname)
        .checkTableFirstRow(newname)
        .clickConfirmActionInMore('Delete');
      cy.tableSearchText(newname).checkEmptyTable();
    });
  });
});
