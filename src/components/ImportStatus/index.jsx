import React from 'react';
import { upperFirst } from 'lodash';
import { Progress } from 'antd';
import PropTypes from 'prop-types';
import Status from 'components/Status';
import styles from './index.less';

const Index = ({ current, isProcessing, processPercent, color }) => {
  if (!isProcessing) {
    return <Status status={current} text={upperFirst(current)} />;
  }

  return (
    <div className={styles.container}>
      <Progress
        strokeColor={color}
        trailColor="#DFE1EC"
        percent={processPercent}
        showInfo={false}
      />
      <div className={styles.text}>
        {`${upperFirst(current)}  ${processPercent}%`}
      </div>
    </div>
  );
};

Index.propTypes = {
  color: PropTypes.string,
  current: PropTypes.string.isRequired,
  isProcessing: PropTypes.bool,
  processPercent: PropTypes.number,
};

Index.defaultProps = {
  color: globalCSS.successColor,
  isProcessing: false,
  processPercent: 0,
};

export default Index;
