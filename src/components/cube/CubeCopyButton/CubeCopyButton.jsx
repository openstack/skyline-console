import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import CopyIcon from 'asset/cube/monochrome/copy.svg';
import classNames from 'classnames';
import styles from './index.less';

export const CubeCopyButton = (props) => {
  const { className, children, size = 14 } = props;

  const [showCopied, setShowCopied] = useState(false);

  const onMouseLeave = () => {
    setShowCopied(false);
  };

  const onClick = () => {
    if ('navigator' in window) {
      window.navigator.clipboard.writeText(children);
    }
    setShowCopied(true);
  };

  return (
    <Tooltip title={showCopied ? 'Copied' : 'Copy'}>
      <CopyIcon
        className={classNames(styles['copy-button'], className)}
        width={size}
        height={size}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      />
    </Tooltip>
  );
};

CubeCopyButton.propTypes = {
  className: PropTypes.string,
  children: PropTypes.string.isRequired,
  size: PropTypes.number,
};

CubeCopyButton.defaultProps = {
  className: undefined,
  size: 14,
};
