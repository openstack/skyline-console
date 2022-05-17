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

import React from 'react';
import { inject, observer } from 'mobx-react';
import Base from 'containers/BaseDetail';
import SimpleTable from 'components/Tables/SimpleTable';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [
      this.baseInfoCard,
      this.driverCard,
      this.bootDeviceCard,
      this.propertiesCard,
      this.traitCard,
      this.resourceClassCard,
    ];
    return cards;
  }

  get rightCards() {
    return [this.validateCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Chassis ID'),
        dataIndex: 'chassis_uuid',
      },
      {
        label: t('Resource Class'),
        dataIndex: 'resource_class',
      },
      {
        label: t('Management'),
        dataIndex: 'maintenance',
        valueRender: 'yesNo',
      },
      {
        label: t('Management Reason'),
        dataIndex: 'maintenance_reason',
      },
    ];
    return {
      title: t('Base Info'),
      options,
    };
  }

  get driverCard() {
    const { driver_info: info = {} } = this.detailData || {};
    const options = Object.keys(info).map((key) => ({
      label: key,
      dataIndex: key,
      render: () => info[key],
    }));

    return {
      title: t('Driver Info'),
      options,
    };
  }

  get bootDeviceCard() {
    const options = [
      {
        label: t('Boot Device'),
        dataIndex: 'bootDevice.boot_device',
      },
      {
        label: t('Persistent'),
        dataIndex: 'bootDevice.persistent',
        valueRender: 'yesNo',
      },
    ];
    return {
      title: t('Boot Device'),
      options,
    };
  }

  get propertiesCard() {
    const { properties: info = {} } = this.detailData || {};
    const options = Object.keys(info).map((key) => ({
      label: key,
      dataIndex: key,
      render: () => info[key],
    }));
    return {
      title: t('Properties'),
      options,
    };
  }

  get traitCard() {
    const options = [
      {
        label: t('Traits'),
        dataIndex: 'traits',
        render: (value) => {
          if (!value) {
            return '-';
          }
          return value.map((it) => <div>{it}</div>);
        },
      },
    ];
    return {
      title: t('Traits'),
      options,
    };
  }

  get resourceClassCard() {
    const options = [
      {
        label: t('Resource Class'),
        dataIndex: 'resource_class',
      },
    ];
    return {
      title: t('Resource Class'),
      options,
    };
  }

  get validateCard() {
    const { validate = {} } = this.detailData || {};
    const data = Object.keys(validate).map((key) => ({
      value: this.detailData[`${key}_interface`],
      name: key,
      ...validate[key],
    }));
    const columns = [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Valid'),
        dataIndex: 'result',
        valueRender: 'yesNo',
      },
      {
        title: t('Current Interface'),
        dataIndex: 'value',
      },
      {
        title: t('Reason'),
        dataIndex: 'reason',
        width: 300,
      },
    ];
    const content = <SimpleTable columns={columns} data={data} />;
    const options = [
      {
        label: '',
        content,
      },
    ];
    return {
      title: t('Interface Info'),
      labelCol: 0,
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
