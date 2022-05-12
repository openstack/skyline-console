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

export const vpnStatus = {
  ACTIVE: t('Active'),
  DOWN: t('Down'),
  BUILD: t('Build'),
  ERROR: t('Error'),
  PENDING_CREATE: t('Pending Create'),
  PENDING_UPDATE: t('Pending Update'),
  PENDING_DELETE: t('Pending Delete'),
};

export const vpnStatusOptions = Object.keys(vpnStatus).map((key) => ({
  label: vpnStatus[key],
  value: key,
  key,
}));

export const authAlgorithmOptions = ['sha1', 'sha256', 'sha384', 'sha512'].map(
  (i) => ({
    label: i,
    value: i,
    key: i,
  })
);

export const encryptionAlgorithmOptions = [
  '3des',
  'aes-128',
  'aes-192',
  'aes-256',
].map((i) => ({
  label: i,
  value: i,
  key: i,
}));

export const pfsOptions = ['group2', 'group5', 'group14'].map((i) => ({
  label: i,
  value: i,
  key: i,
}));

export const ikePolicyIKEVersionOptions = ['v1', 'v2'].map((i) => ({
  label: i,
  value: i,
  key: i,
}));

export const ipsecPolicyEncapsulationModeOptions = ['tunnel', 'transport'].map(
  (i) => ({
    label: i,
    value: i,
    key: i,
  })
);

export const ipsecPolicyTransformProtocolOptions = ['esp', 'ah', 'ah-esp'].map(
  (i) => ({
    label: i,
    value: i,
    key: i,
  })
);
