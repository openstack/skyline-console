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

import React, { useEffect, useState } from 'react';
import { Popover, Spin, Table } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { getRender } from 'utils/table';

const getColumn = (column) => {
  const { valueRender, render, ...rest } = column;
  const newRender = render || getRender(valueRender);
  return {
    ...rest,
    render: newRender,
  };
};

function PopupResources({ getRequests, getData, columns, pagination }) {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      if (getData) {
        const ret = await getData();
        setData(ret);
        setLoading(false);
      } else if (getRequests) {
        const requests = getRequests();
        const ret = await Promise.all(requests);
        setData(ret);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (isLoading) {
    return <Spin />;
  }
  const currentColumns = columns.map((c) => getColumn(c));
  return (
    <Table columns={currentColumns} dataSource={data} pagination={pagination} />
  );
}

const IPopoverProps = {
  columns: PropTypes.array.isRequired,
  getRequests: PropTypes.func,
  getData: PropTypes.func,
  title: PropTypes.any,
  placement: PropTypes.string,
  pagination: PropTypes.any,
  icon: PropTypes.any,
};

export default function IPopover(props) {
  const {
    columns = [],
    getRequests,
    getData,
    title,
    pagination = false,
    icon = <FileTextOutlined style={{ cursor: 'pointer' }} />,
    ...rest
  } = props;
  const content = (
    <PopupResources
      columns={columns}
      getRequests={getRequests}
      getData={getData}
      pagination={pagination}
    />
  );
  return (
    <>
      <Popover
        content={content}
        destroyTooltipOnHide
        mouseEnterDelay={0.5}
        {...rest}
      >
        {title}&nbsp;{icon}
      </Popover>
    </>
  );
}

IPopover.propTypes = IPopoverProps;
