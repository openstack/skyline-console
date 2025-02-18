import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import styles from './index.less';

// eslint-disable-next-line react/prefer-stateless-function
class CubeCard extends Component {
  render() {
    const { title, extra, isLoading, children } = this.props;

    return (
      <Card
        title={title}
        extra={extra}
        loading={isLoading}
        size="small"
        className={styles['cube-card']}
      >
        <div className={styles['cube-card-body']}>{children}</div>
      </Card>
    );
  }
}

CubeCard.propTypes = {
  title: PropTypes.node,
  extra: PropTypes.node,
  isLoading: PropTypes.bool,
  children: PropTypes.node,
};

CubeCard.defaultProps = {
  title: '',
  extra: null,
  isLoading: false,
  children: null,
};

export default CubeCard;
