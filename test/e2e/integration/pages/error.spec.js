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

import { instanceListUrl } from '../../support/constants';

describe('The Error Page', () => {
  beforeEach(() => {
    cy.login();
  });

  it('successfully 404', () => {
    cy.visit('/404').wait(2000).get('.ant-result-subtitle').should('exist');
  });

  it('successfully not found', () => {
    const url = `${instanceListUrl}/detail/1`;

    cy.visit(url)
      .wait(5000)
      .get('.h1')
      .contains('Resource Not Found')
      .should('exist');
  });
});
