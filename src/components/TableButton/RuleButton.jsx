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

import React, { Component } from 'react';
import TableButton from 'components/TableButton';
import { getSelfColumns } from 'resources/security-group-rule';

export default class RuleButton extends Component {
  getUrl(path, adminStr) {
    return this.isAdminPage ? `${path}${adminStr || '-admin'}` : path;
  }

  getDetailUrl(id) {
    return `${this.getUrl('/network/security-group')}/detail/${id}`;
  }

  render() {
    const { item: { security_group_rules: datas = [] } = {} } = this.props;
    const configs = {
      buttonType: 'link',
      title: t('Security Group Rules'),
      buttonText: t('View Rules'),
      modalSize: 'middle',
      columns: getSelfColumns(this),
      datas,
    };
    return <TableButton {...configs} style={{ paddingLeft: 0 }} />;
  }
}
