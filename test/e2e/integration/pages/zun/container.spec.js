import { onlyOn } from '@cypress/skip-test';
import { zunContainerListUrl } from '../../../support/constants';

const zunServiceEnabled = (Cypress.env('extensions') || []).includes('zun');

onlyOn(!zunServiceEnabled, () => {
  describe('Skip The zunContainer Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(zunServiceEnabled, () => {
  describe('The zunContainer Page', () => {
    const listUrl = zunContainerListUrl;
    const uuid = Cypress._.random(0, 1e6);
    const zunContainerName = `e2e-zunContainer-${uuid}`;

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(0)
        .url()
        .should('include', `${listUrl}/create`)
        .wait(5000)
        .formInput('containerName', zunContainerName)
        .formSelect('image_driver')
        .formInput('image', 'cirros')
        .clickStepActionNextButton()
        .wait(2000)
        .clickStepActionNextButton()
        .wait(2000)
        .clickStepActionNextButton()
        .wait(2000)
        .clickStepActionNextButton()
        .wait(2000)
        .clickStepActionNextButton()
        .waitFormLoading()
        .url()
        .should('include', listUrl)
        .closeNotice()
        .waitStatusTextByFresh('Created');
    });

    it('successfully start', () => {
      cy.tableSimpleSearchText(zunContainerName)
        .checkTableFirstRow(zunContainerName)
        .clickActionInMore('Start')
        .clickConfirmActionSubmitButton()
        .waitStatusTextByFresh('Running');
    });

    it('successfully pause', () => {
      cy.tableSimpleSearchText(zunContainerName)
        .checkTableFirstRow(zunContainerName)
        .clickActionInMore('Pause')
        .clickConfirmActionSubmitButton()
        .waitStatusTextByFresh('Paused');
    });

    it('successfully unpause', () => {
      cy.tableSimpleSearchText(zunContainerName)
        .checkTableFirstRow(zunContainerName)
        .clickActionButtonByTitle('Unpause')
        .clickConfirmActionSubmitButton()
        .waitStatusTextByFresh('Running');
    });

    it('successfully reboot', () => {
      cy.tableSimpleSearchText(zunContainerName)
        .checkTableFirstRow(zunContainerName)
        .clickActionInMore('Reboot')
        .clickConfirmActionSubmitButton()
        .waitStatusTextByFresh('Restarting')
        .wait(5000)
        .waitStatusTextByFresh('Running');
    });

    it('successfully stop', () => {
      cy.tableSimpleSearchText(zunContainerName)
        .checkTableFirstRow(zunContainerName)
        .clickActionInMore('Stop')
        .clickConfirmActionSubmitButton()
        .waitStatusTextByFresh('Stopped');
    });

    it('successfully delete', () => {
      cy.tableSimpleSearchText(zunContainerName)
        .checkTableFirstRow(zunContainerName)
        .clickFirstActionButton()
        .clickConfirmActionSubmitButton()
        .checkEmptyTable();
    });
  });
});
