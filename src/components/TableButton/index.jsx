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
import ModalButton from 'components/ModalButton';
import PropTypes from 'prop-types';
import { Table } from 'antd';

export default class TableButton extends Component {
  static propTypes() {
    return {
      title: PropTypes.string.isRequired,
      buttonType: PropTypes.string,
      isDanger: PropTypes.bool,
      data: PropTypes.array,
      columns: PropTypes.array,
      modalSize: PropTypes.string,
      className: PropTypes.func,
      buttonText: PropTypes.string,
      style: PropTypes.string,
      hasPagination: PropTypes.bool,
    };
  }

  static defaultProps = {
    buttonType: 'link',
    isDanger: false,
    data: [],
    columns: [],
    modalSize: 'middle',
    className: '',
    buttonText: t('View Detail'),
    title: t('Detail'),
    hasPagination: true,
  };

  renderTable = () => {
    const { data, columns, hasPagination } = this.props;
    const configs = {
      columns,
      dataSource: data,
    };
    if (!hasPagination) {
      configs.pagination = false;
    }
    return <Table {...configs} />;
  };

  render() {
    const { buttonType, isDanger, title, buttonText, modalSize, style } =
      this.props;
    const configs = {
      buttonType,
      isDanger,
      title,
      buttonText,
      modalSize,
      style,
      render: this.renderTable,
    };
    return <ModalButton {...configs} />;
  }
}
