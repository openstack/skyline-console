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

import globalRootStore from 'stores/root';

export const availabilityZoneState = {
  available: t('Available'),
  unavailable: t('Unavailable'),
};

export const availabilityZoneResource = {
  router: t('Router'),
  network: t('Network'),
};

export function enablePFW() {
  const { neutronExtensions: extensions } = globalRootStore;
  let enabled = false;
  let pfwInFip = false;
  extensions.forEach((i) => {
    if (i.alias === 'floating-ip-port-forwarding') {
      enabled = true;
    } else if (i.alias === 'expose-port-forwarding-in-fip') {
      pfwInFip = true;
    }
  });
  return enabled && pfwInFip;
}
