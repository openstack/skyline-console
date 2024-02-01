import { get } from 'lodash';
import qs from 'qs';
import React from 'react';
import { Link } from 'react-router-dom';

const routeMap = {};

const normalizeRoute = (record) => {
  return {
    path: record.routePath || record.path,
    // redirect: record.redirect,
    key: record.key,
    // meta: record.meta || {},
    // beforeEnter: record.beforeEnter,
    children: record.children || [],
  };
};

const insertRouteMap = (record = {}) => {
  const item = normalizeRoute(record);
  if (item.key) {
    routeMap[item.key] = item;
  }
  if (item.children.length) {
    item.children.forEach((child) => insertRouteMap(child));
  }
};

export const setRouteMap = (routes = []) => {
  routes.forEach((r) => insertRouteMap(r));
  console.log('routeMap', routeMap);
  return routeMap;
};

const generatePath = (record, params) => {
  const { path } = record;
  if (!params) {
    return path;
  }
  let newPath = path;
  Object.keys(params).forEach((key) => {
    newPath = newPath.replace(`:${key}`, params[key]);
  });
  return newPath;
};

export const getPath = ({ key, params, query = {} }) => {
  const record = get(routeMap, key);
  if (!record) {
    return '/';
  }
  const path = generatePath(record, params);
  const str = qs.stringify(query);
  return str ? `${path}?${str}` : path;
};

export const getLinkRender = ({
  key,
  params,
  query = {},
  value,
  extra = {},
}) => {
  if (!value) {
    return null;
  }
  const path = getPath({ key, params, query });
  return (
    <Link to={path} {...extra}>
      {value}
    </Link>
  );
};
