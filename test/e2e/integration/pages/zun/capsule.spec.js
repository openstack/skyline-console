import { onlyOn } from '@cypress/skip-test';
import { zunCapsuleListUrl } from '../../../support/constants';

const zunServiceEnabled = (Cypress.env('extensions') || []).includes('zun');

onlyOn(!zunServiceEnabled, () => {
  describe('Skip The zunCapsule Page', () => {
    it('successfully skip', () => {});
  });
});

onlyOn(zunServiceEnabled, () => {
  describe('The zunCpsule Page', () => {
    const listUrl = zunCapsuleListUrl;
    const filename = 'zunCapsuleTemplate.yaml';
    const zunCapsuleName = 'e2e-zun-capsule';

    beforeEach(() => {
      cy.login(listUrl);
    });

    it('successfully create', () => {
      cy.clickHeaderActionButton(0)
        .formAttachFile('template_file', filename)
        .clickModalActionSubmitButton();
    });

    it('successfully delete', () => {
      cy.tableSimpleSearchText(zunCapsuleName)
        .checkTableFirstRow(zunCapsuleName)
        .clickFirstActionButton()
        .clickConfirmActionSubmitButton()
        .checkEmptyTable();
    });
  });
});
