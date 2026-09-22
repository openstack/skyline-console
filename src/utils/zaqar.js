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

import { v4 as uuidv4 } from 'uuid';

const ZAQAR_CLIENT_UUID_KEY = 'zaqar_client_uuid';

/**
 * Get or generate a Zaqar Client-ID (RFC 4122 UUID).
 *
 * Zaqar API requires a unique Client-ID header on every request to:
 *   - Prevent message echo (client won't receive its own posted messages)
 *   - Track claim ownership per client
 *
 * We use sessionStorage so that:
 *   - Each browser session gets its own UUID (isolates concurrent users)
 *   - The UUID survives page refreshes within the same tab
 *   - It auto-clears when the tab/browser closes (no stale state)
 */
export const getZaqarClientId = () => {
  let clientId = sessionStorage.getItem(ZAQAR_CLIENT_UUID_KEY);
  if (!clientId) {
    clientId = uuidv4();
    sessionStorage.setItem(ZAQAR_CLIENT_UUID_KEY, clientId);
  }
  return clientId;
};
