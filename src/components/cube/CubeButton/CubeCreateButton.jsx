/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import PlusSvgIcon from 'asset/cube/monochrome/plus.svg';
import styles from './index.less';

class CubeCreateButton extends Component {
  render() {
    const { children, ...restProps } = this.props;
    return (
      <Button {...restProps} size="middle" className={styles['create-button']}>
        <PlusSvgIcon width={12} height={12} />
        {children}
      </Button>
    );
  }
}

CubeCreateButton.propTypes = {
  children: PropTypes.node,
};

export default CubeCreateButton;
