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
import { stackListUrl } from '../../../support/constants';

const heatServiceEnabled = (Cypress.env('extensions') || []).includes('heat');

onlyOn(!heatServiceEnabled, () => {
  describe('Skip The Stack Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(heatServiceEnabled, () => {
  describe('The Stack Page', () => {
    const listUrl = stackListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const name = `e2e-stack-${uuid}`;
    const nameAbandon = `e2e-stack-abandon-${uuid}`;
    const contentFile = 'stack-content.yaml';
    const paramFile = 'stack-params.yaml';
    const volumeName = `e2e-volume-for-stack-${uuid}`;
    const volumeNameUpdate = `e2e-volume-for-stack-update-${uuid}`;
    const volumeNameAbandon = `e2e-volume-for-stack-abandon-${uuid}`;

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully create', () => {
      const volumeJson = {
        name: volumeName,
      };
      cy.clickHeaderActionButton(0, 2000)
        .formAttachFile('content', contentFile)
        .formAttachFile('params', paramFile)
        .clickStepActionNextButton()
        .wait(2000)
        .formInput('name', name)
        .formJsonInput('volume_name_spec', volumeJson)
        .clickStepActionNextButton()
        .waitFormLoading()
        .wait(5000)
        .tableSearchSelectText('Name', name)
        .waitStatusActiveByRefresh();
    });

    it('successfully detail', () => {
      cy.tableSearchSelectText('Name', name)
        .checkTableFirstRow(name)
        .goToDetail()
        .checkDetailName(name);
      cy.clickDetailTab('Stack Resources', 'resource')
        .clickDetailTab('Stack Events', 'event')
        .clickDetailTab('YAML File', 'template');
      cy.goBackToList(listUrl);
    });

    it('successfully link resource', () => {
      cy.tableSearchSelectText('Name', name)
        .checkTableFirstRow(name)
        .goToDetail()
        .checkDetailName(name);
      cy.clickDetailTab('Stack Resources').goToDetail();
    });

    it('successfully update template', () => {
      const volumeJson = {
        name: volumeNameUpdate,
      };
      cy.tableSearchSelectText('Name', name)
        .clickActionInMore('Update Template')
        .wait(2000)
        .formAttachFile('content', contentFile)
        .formAttachFile('params', paramFile)
        .clickStepActionNextButton()
        .wait(2000)
        .formJsonInput('volume_name_spec', volumeJson)
        .clickStepActionNextButton()
        .waitFormLoading()
        .wait(5000)
        .tableSearchSelectText('Name', name)
        .waitStatusActiveByRefresh();
    });

    it('successfully delete', () => {
      cy.tableSearchSelectText('Name', name)
        .clickConfirmActionInFirst()
        .wait(10000);
    });

    it('successfully create for abandon', () => {
      const volumeJson = {
        name: volumeNameAbandon,
      };
      cy.clickHeaderActionButton(0, 2000)
        .formAttachFile('content', contentFile)
        .formAttachFile('params', paramFile)
        .clickStepActionNextButton()
        .wait(2000)
        .formInput('name', nameAbandon)
        .wait(2000)
        .formJsonInput('volume_name_spec', volumeJson)
        .clickStepActionNextButton()
        .waitFormLoading()
        .wait(5000)
        .tableSearchSelectText('Name', nameAbandon)
        .waitStatusActiveByRefresh();
    });

    it('successfully abandon stack', () => {
      cy.tableSearchSelectText('Name', nameAbandon).clickConfirmActionInMore(
        'Abandon Stack'
      );
    });

    it('successfully delete resource', () => {
      cy.deleteAll('volume', volumeNameAbandon);
    });
  });
});
