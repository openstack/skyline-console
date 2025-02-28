import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import styles from './index.less';

// eslint-disable-next-line react/prefer-stateless-function
export default class CubeCardDetail extends Component {
  render() {
    const { children, ...restProps } = this.props;

    return (
      <Card {...restProps} size="small" className={styles['cube-card-small']}>
        <div className={styles['cube-card-body']}>{children}</div>
      </Card>
    );
  }
}

CubeCardDetail.propTypes = {
  children: PropTypes.node,
};

CubeCardDetail.defaultProps = {
  children: null,
};
