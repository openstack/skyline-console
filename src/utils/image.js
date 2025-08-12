import { isNaN } from 'lodash';

/**
 * @param {Array<string>} response
 * @returns {Array<{ value: string, label: string }>}
 * @example
 * stringsToOptions(['CentOS', 'Ubuntu']);
 * // Returns:
 * // [
 * //   { value: 'CentOS', label: 'CentOS' },
 * //   { value: 'Ubuntu', label: 'Ubuntu' }
 * // ]
 */
export const stringsToOptions = (response) => {
  if (!response || response.length === 0) return [];
  return response.map((key) => ({
    value: key,
    // TODO: i18n
    label: key,
  }));
};

/**
 *
 * @param {number} sizeMiB - The size in MiB
 * @returns {string} - The formatted size string in either "MiB" or "GiB"
 * @example
 * computeSizeMiB(2048);
 * // Returns: "2.00 GiB"
 */
export const computeSizeMiB = (sizeMiB) => {
  if (sizeMiB == null || isNaN(sizeMiB)) return '-';

  if (sizeMiB >= 1024) return `${(sizeMiB / 1024).toFixed(2)} GiB`;

  return `${sizeMiB.toFixed(2)} MiB`;
};

/**
 * @param {string} dateString - A date string in ISO 8601 format with a timezone offset.
 * @returns {string} - The equivalent UTC date string in ISO 8601 format.
 * @example
 * toUtcFormat("2025-08-11T12:16:11+08:00");
 * // Returns: "2025-08-11T04:16:11Z"
 */
export const toUtcFormat = (dateString) => {
  // Handle null, undefined, or empty string
  if (!dateString) {
    return null;
  }

  // Try to create a date object
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};
