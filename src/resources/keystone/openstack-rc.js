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

// eslint-disable-next-line import/prefer-default-export
export const getPwdOpenRc = (data) => {
  const {
    authUrl,
    projectId,
    projectName,
    projectDomain,
    userDomain,
    userName,
    region,
  } = data;
  const openstackRc =
    '#!/usr/bin/env bash\n' +
    '# To use an OpenStack cloud you need to authenticate against the Identity\n' +
    '# service named keystone, which returns a **Token** and **Service Catalog**.\n' +
    '# The catalog contains the endpoints for all services the user/tenant has\n' +
    '# access to - such as Compute, Image Service, Identity, Object Storage, Block\n' +
    '# Storage, and Networking (code-named nova, glance, keystone, swift,\n' +
    '# cinder, and neutron).\n' +
    '#\n' +
    '# *NOTE*: Using the 3 *Identity API* does not necessarily mean any other\n' +
    '# OpenStack API is version 3. For example, your cloud provider may implement\n' +
    '# Image API v1.1, Block Storage API v2, and Compute API v2.0. OS_AUTH_URL is\n' +
    '# only for the Identity API served through keystone.\n' +
    `export OS_AUTH_URL=${authUrl}/v3/\n` +
    '\n' +
    '# With the addition of Keystone we have standardized on the term **project**\n' +
    '# as the entity that owns the resources.\n' +
    `export OS_PROJECT_ID=${projectId} \n` +
    `export OS_PROJECT_NAME=${projectName}\n` +
    `export OS_PROJECT_DOMAIN_NAME=${projectDomain}\n` +
    `export OS_USER_DOMAIN_NAME=${userDomain}\n` +
    '\n' +
    '# unset v2.0 items in case set\n' +
    'unset OS_TENANT_ID\n' +
    'unset OS_TENANT_NAME\n' +
    '# In addition to the owning entity (tenant), OpenStack stores the entity\n' +
    '# performing the action as the **user**.\n' +
    `export OS_USERNAME=${userName}\n` +
    '\n' +
    '# With Keystone you pass the keystone password.\n' +
    'echo "Please enter your OpenStack Password for project $OS_PROJECT_NAME as user $OS_USERNAME: "\n' +
    'read -sr OS_PASSWORD_INPUT\n' +
    'export OS_PASSWORD=$OS_PASSWORD_INPUT\n' +
    '# If your configuration has multiple regions, we set that information here.\n' +
    '# OS_REGION_NAME is optional and only valid in certain environments.\n' +
    `export OS_REGION_NAME=${region}\n` +
    '\n' +
    "# Don't leave a blank variable, unset it if it was empty\n" +
    'if [ -z "$OS_REGION_NAME" ]; then unset OS_REGION_NAME; fi\n' +
    'export OS_INTERFACE=public\n' +
    'export OS_IDENTITY_API_VERSION=3\n' +
    '\n' +
    '# If OS_AUTH_URL use private SSL, Please add CACERT file path \n' +
    '# export OS_CACERT={crtPath}';

  return openstackRc;
};

export const getCredentialOpenRc = (data) => {
  const { authUrl, region } = data;
  const openstackRc =
    '#!/usr/bin/env bash\n' +
    '# To use an OpenStack cloud you need to authenticate against the Identity\n' +
    '# service named keystone, which returns a **Token** and **Service Catalog**.\n' +
    '# The catalog contains the endpoints for all services the user/tenant has\n' +
    '# access to - such as Compute, Image Service, Identity, Object Storage, Block\n' +
    '# Storage, and Networking (code-named nova, glance, keystone, swift,\n' +
    '# cinder, and neutron).\n' +
    '#\n' +
    '# *NOTE*: Using the 3 *Identity API* does not necessarily mean any other\n' +
    '# OpenStack API is version 3. For example, your cloud provider may implement\n' +
    '# Image API v1.1, Block Storage API v2, and Compute API v2.0. OS_AUTH_URL is\n' +
    '# only for the Identity API served through keystone.\n' +
    `export OS_AUTH_URL=${authUrl}/v3/\n` +
    '\n' +
    '# With Keystone you pass the keystone password.\n' +
    'echo "Please enter your OpenStack Credential ID as OS_APPLICATION_CREDENTIAL_ID: "\n' +
    'read -sr OS_APPLICATION_CREDENTIAL_ID\n' +
    'export OS_APPLICATION_CREDENTIAL_ID=$OS_APPLICATION_CREDENTIAL_ID\n' +
    'echo "Please enter your OpenStack Credential Secret as OS_APPLICATION_CREDENTIAL_SECRET: "\n' +
    'read -sr OS_APPLICATION_CREDENTIAL_SECRET\n' +
    'export OS_APPLICATION_CREDENTIAL_SECRET=$OS_APPLICATION_CREDENTIAL_SECRET\n' +
    '\n' +
    "# Don't leave a blank variable, unset it if it was empty\n" +
    'if [ -z "$OS_REGION_NAME" ]; then unset OS_REGION_NAME; fi\n' +
    'export OS_INTERFACE=public\n' +
    'export OS_IDENTITY_API_VERSION=3\n' +
    'export OS_AUTH_TYPE=v3applicationcredential\n' +
    '# If your configuration has multiple regions, we set that information here.\n' +
    '# OS_REGION_NAME is optional and only valid in certain environments.\n' +
    `export OS_REGION_NAME=${region}\n` +
    '\n' +
    '# If OS_AUTH_URL use private SSL, Please add CACERT file path \n' +
    '# export OS_CACERT={crtPath}';

  return openstackRc;
};
