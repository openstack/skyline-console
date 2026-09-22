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

import { action, observable } from 'mobx';
import client from 'client';
import Base from 'stores/base';

export class ClaimStore extends Base {
  @observable
  claimedMessages = [];

  @observable
  lastClaimId = null;

  @observable
  lastClaimQueue = null;

  get client() {
    return client.zaqar.queues.claims;
  }

  get needGetProject() {
    return false;
  }

  get listResponseKey() {
    return null;
  }

  get paramsFunc() {
    return () => ({});
  }

  // Create a claim — returns the array of claimed messages
  // POST /v2/queues/{name}/claims
  @action
  createClaim = async (queueName, ttl = 300, grace = 60, limit = 1) => {
    // Use createClaim which returns the full axios response so we can read Location header
    const response = await this.submitting(
      client.zaqar.queues.createClaim(queueName, { ttl, grace, limit })
    );

    // Extract claimed messages from response body
    const responseData = response && response.data;
    let messages = [];
    if (Array.isArray(responseData)) {
      messages = responseData;
    } else if (responseData && Array.isArray(responseData.messages)) {
      messages = responseData.messages;
    }

    // Extract claim ID from Location header: /v2/queues/{name}/claims/{id}
    const locationHeader =
      response &&
      response.headers &&
      (response.headers.location || response.headers.Location);
    let claimId = null;
    if (locationHeader) {
      const parts = locationHeader.split('/claims/');
      claimId = parts.length > 1 ? parts[1].split('/')[0] : null;
    }
    // Fallback: try from message claim_id field
    if (!claimId && messages.length > 0) {
      claimId =
        messages[0].claim_id ||
        (messages[0].href
          ? messages[0].href.split('/claims/')[1]?.split('/')[0]
          : null);
    }

    this.claimedMessages = messages.map((item) => ({
      ...item,
      id: item.href ? item.href.split('/messages/')[1] : item.id,
    }));
    this.lastClaimId = claimId;
    this.lastClaimQueue = queueName;
    return { messages: this.claimedMessages, claimId };
  };

  // DELETE /v2/queues/{name}/claims/{claim_id}
  @action
  releaseClaim = (queueName, claimId) =>
    this.submitting(this.client.delete(queueName, claimId));

  @action
  clearClaimed() {
    this.claimedMessages = [];
    this.lastClaimId = null;
    this.lastClaimQueue = null;
  }
}

const globalClaimStore = new ClaimStore();
export default globalClaimStore;
