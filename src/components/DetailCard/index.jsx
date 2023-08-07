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
import { Row, Col, Skeleton, Tooltip, Typography, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { has, get, isNumber } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { renderFilterMap } from 'utils/index';
import { getValueMapRender, getUnitRender } from 'utils/table';
import Status from 'components/Status';
import styles from './index.less';

const { Paragraph } = Typography;

const getContentValue = (value, dataIndex, data, copyable) => {
  const status = get(data, dataIndex);
  // get status
  if (
    dataIndex.toLowerCase().indexOf('status') >= 0 ||
    dataIndex.toLowerCase().indexOf('state') >= 0
  ) {
    return <Status status={status} text={value} />;
  }
  // get copyable
  if (value !== '-') {
    if (
      (/_?id/g.test(dataIndex.toLowerCase()) && copyable !== false) ||
      copyable
    ) {
      return <Paragraph copyable={copyable}>{value}</Paragraph>;
    }
  }
  return value || '-';
};

const getContent = (data, option) => {
  const { content, dataIndex, render, valueRender, copyable, valueMap, unit } =
    option;
  if (has(option, 'content')) {
    return copyable ? (
      <Paragraph copyable={copyable}>{content}</Paragraph>
    ) : (
      content
    );
  }
  let value = get(data, dataIndex);
  if (!render) {
    if (valueRender) {
      const renderFunc = renderFilterMap[valueRender];
      value = renderFunc && renderFunc(value);
    } else if (valueMap) {
      value = getValueMapRender(option)(value);
    } else if (unit) {
      value = getUnitRender(option)(value);
    }
  } else {
    value = render(value, data);
  }
  if (!isNumber(value)) {
    value = value || '-';
  }
  return getContentValue(value, dataIndex, data, copyable);
};

const renderLabel = (option) => {
  const { label, tooltip = '' } = option;
  if (!tooltip) {
    return label;
  }
  return (
    <Tooltip title={tooltip}>
      <span>{label}</span>
    </Tooltip>
  );
};

const renderOptions = (options, data, loading, labelCol, contentCol) =>
  options
    .filter((option) => !option.hidden)
    .map((option, index) => {
      const currentLabelCol = has(option, 'labelCol')
        ? option.labelCol
        : labelCol;
      const currentContentCol = has(option, 'contentCol')
        ? option.contentCol
        : contentCol;
      return (
        <Skeleton loading={loading} key={`detail-row-${index}`}>
          <Row className={classnames(styles['card-item'], 'sl-card-item')}>
            <Col span={currentLabelCol}>{renderLabel(option)}</Col>
            <Col span={currentContentCol}>{getContent(data, option)}</Col>
          </Row>
        </Skeleton>
      );
    });

const DetailCard = ({
  title,
  titleHelp,
  loading,
  options,
  data,
  labelCol,
  contentCol,
  className,
  button,
}) => {
  let titleHelpValue;
  if (titleHelp) {
    titleHelpValue = (
      <Popover
        arrowPointAtCenter="true"
        placement="rightTop"
        content={titleHelp}
        getPopupContainer={(node) => node.parentNode}
      >
        <InfoCircleOutlined className={styles['title-help']} />
      </Popover>
    );
  }
  return (
    <div className={classnames(styles.card, className)}>
      <div className={styles['card-content']}>
        <Skeleton loading={loading}>
          <Row className={classnames(styles['card-item'], 'sl-card-item')}>
            <h3> {title} </h3>
            {titleHelpValue}
            {button}
          </Row>
        </Skeleton>
        {renderOptions(options, data, loading, labelCol, contentCol)}
      </div>
    </div>
  );
};

const detailProps = PropTypes.shape({
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.any,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  dataIndex: PropTypes.string,
  valueRender: PropTypes.string,
  labelCol: PropTypes.number,
  contentCol: PropTypes.number,
});

DetailCard.defaultProps = {
  labelCol: 8,
  contentCol: 16,
  options: [],
  title: '',
  titleHelp: '',
  loading: false,
  data: {},
};

DetailCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  titleHelp: PropTypes.any,
  options: PropTypes.arrayOf(detailProps),
  loading: PropTypes.bool,
  data: PropTypes.object,
  labelCol: PropTypes.number,
  contentCol: PropTypes.number,
};

export default DetailCard;
