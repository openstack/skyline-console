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

import skyline from './skyline';
import nova from './nova';
import cinder from './cinder';
import glance from './glance';
import neutron from './neutron';
import keystone from './keystone';
import heat from './heat';
import octavia from './octavia';
import placement from './placement';
import ironic from './ironic';
import swift from './swift';
import trove from './trove';
import manila from './manila';
import barbican from './barbican';
import zun from './zun';
import magnum from './magnum';
import masakari from './masakari';
import designate from './designate';

const client = {
  skyline,
  nova,
  cinder,
  glance,
  neutron,
  keystone,
  heat,
  octavia,
  placement,
  ironic,
  swift,
  trove,
  manila,
  barbican,
  zun,
  magnum,
  masakari,
  designate,
};

window.client = client;

export default client;
