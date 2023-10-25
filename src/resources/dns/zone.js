import { getOptions } from 'utils';

export const ZONE_TYPE_ENUM = {
  primary: 'PRIMARY',
  secondary: 'SECONDARY',
};

export const ZONE_TYPES = {
  [ZONE_TYPE_ENUM.primary]: t('Primary'),
  [ZONE_TYPE_ENUM.secondary]: t('Secondary'),
};

export const zoneTypeOptions = getOptions(ZONE_TYPES);

export const zoneNameRegex = /^.+\.$/;

export const zoneNameMessage = t('The zone name should end with "."');

export const validateZoneName = (rule, value) => {
  if (!value) {
    return Promise.resolve();
  }
  if (!zoneNameRegex.test(value)) {
    return Promise.reject(zoneNameMessage);
  }
  const labels = value.trim().split('.');
  if (labels.length <= 1) {
    return Promise.reject(
      new Error(t('More than one label is required, such as: "example.org."'))
    );
  }
  return Promise.resolve();
};

export const ZONE_STATUS = {
  ACTIVE: t('Active'),
  PENDING: t('Pending'),
  ERROR: t('Error'),
};
