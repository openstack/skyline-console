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

import { observer, inject } from 'mobx-react';
import Base from 'containers/TabList';
import globalSettingStore from 'stores/skyline/setting';
import { flavorArchitectures, getAllArchitecture } from 'resources/nova/flavor';
import X86 from './X86';
import Heterogeneous from './Heterogeneous';
import Arm from './Arm';
import BareMetal from './BareMetal';
import Other from './Other';

export class Flavor extends Base {
  init() {
    this.settingStore = globalSettingStore;
    this.getSettings();
  }

  async getSettings() {
    await this.settingStore.fetchList();
    const architectures = getAllArchitecture(this.settingStore.list.data);
    this.setState({
      architectures,
    });
  }

  get tabs() {
    const { architectures = [] } = this.state;
    const allMap = {
      x86_architecture: X86,
      heterogeneous_computing: Heterogeneous,
      bare_metal: BareMetal,
      arm_architecture: Arm,
      custom: Other,
    };
    return architectures.map((it) => ({
      title: flavorArchitectures[it],
      key: it,
      component: allMap[it],
    }));
  }
}

export default inject('rootStore')(observer(Flavor));
