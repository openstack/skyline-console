// Copyright 2026 WIIT AG
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

export const getPwdCloudsYaml = (data) => {
  const {
    authUrl,
    projectId,
    projectName,
    projectDomain,
    userDomain,
    userName,
    region,
  } = data;
  const cloudsYaml =
    `clouds:\n` +
    `  ${region || 'openstack'}:\n` +
    `    auth:\n` +
    `      auth_url: ${authUrl}\n` +
    `      project_id: ${projectId}\n` +
    `      project_name: ${projectName}\n` +
    `      project_domain_name: ${projectDomain}\n` +
    `      user_domain_name: ${userDomain}\n` +
    `      username: ${userName}\n` +
    `    region_name: ${region}\n` +
    `    interface: public\n` +
    `    identity_api_version: 3\n`;

  return cloudsYaml;
};

export const getCredentialCloudsYaml = (data) => {
  const { authUrl, region } = data;
  const cloudsYaml =
    `clouds:\n` +
    `  ${region || 'openstack'}:\n` +
    `    auth:\n` +
    `      auth_url: ${authUrl}\n` +
    `    auth_type: v3applicationcredential\n` +
    `    interface: public\n` +
    `    identity_api_version: 3\n` +
    `    region_name: ${region}\n`;

  return cloudsYaml;
};
