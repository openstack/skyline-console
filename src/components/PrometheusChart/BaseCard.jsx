import { Card, Select } from 'antd';
import React, { createContext, useEffect, useState } from 'react';
import VisibleObserver from '../VisibleObserver';
import { createFetchPrometheusClient, createDataHandler } from './utils';
import style from './style.less';

export const PrometheusContext = createContext({
  data: [],
  device: '',
  devices: [],
});

function getChartData(data, device, devices) {
  if (device && devices.length !== 0) {
    return data.filter((d) => d.device === device);
  }
  return data;
}

const BaseCard = (props) => {
  const {
    fetchPrometheusFunc,
    createFetchParams,
    handleDataParams,
    fetchDataParams,
    title,
    visibleHeight,
    extra,
    renderContent,
  } = props;

  const [initData, setInitData] = useState([]);

  const [chartData, setChartData] = useState([]);

  const [device, setDevice] = useState('');

  const [devices, setDevices] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = createFetchPrometheusClient(
    createFetchParams,
    fetchPrometheusFunc
  );

  const dataHandler = createDataHandler(handleDataParams);

  const passedContext = {
    data: chartData,
    device,
    devices,
    modifyKeys: handleDataParams.modifyKeys,
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const data = await fetchData(fetchDataParams);
      const {
        retData: handledData,
        device: newDevice,
        devices: newDevices,
      } = dataHandler(data);
      // save base response
      setInitData(handledData);

      // save device information
      setDevice(newDevice);
      setDevices(newDevices);

      // refresh component
      const newChartData = getChartData(handledData, newDevice, newDevices);
      setChartData(newChartData);

      // setLoading
      setIsLoading(false);
    })();
  }, []);

  const handleDeviceChange = (newDevice) => {
    setIsLoading(true);
    // refresh component
    const newChartData = getChartData(initData, newDevice, devices);
    setDevice(newDevice);
    setChartData(newChartData);
    setIsLoading(false);
  };

  const filterChartData = (filter) => {
    setIsLoading(true);
    // refresh component
    const newChartData = initData.filter(filter);
    setChartData(newChartData);
    setIsLoading(false);
  };

  const extraRender = (
    <>
      {!isLoading && device && devices.length !== 0 && (
        <Select
          defaultValue={device}
          style={{ width: 150, marginRight: 16 }}
          options={devices.map((i) => ({
            label: i,
            value: i,
          }))}
          onChange={handleDeviceChange}
        />
      )}
      {extra &&
        extra({
          initData,
          chartData,
          device,
          devices,
          modifyKeys: handleDataParams.modifyKeys,
          filterChartData,
        })}
    </>
  );

  return (
    <PrometheusContext.Provider value={passedContext}>
      <Card
        className={style['remove-extra-padding']}
        bodyStyle={{
          // padding 24
          minHeight: visibleHeight + 48,
        }}
        title={title}
        extra={extraRender}
        loading={isLoading}
      >
        <VisibleObserver style={{ width: '100%', height: visibleHeight }}>
          {(visible) =>
            visible ? (
              <PrometheusContext.Consumer>
                {(v) => renderContent(v)}
              </PrometheusContext.Consumer>
            ) : null
          }
        </VisibleObserver>
      </Card>
    </PrometheusContext.Provider>
  );
};

BaseCard.defaultProps = {
  visibleHeight: 100,
};

export default BaseCard;
