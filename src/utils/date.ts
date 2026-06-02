/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns the date string in 'YYYY-MM-DD' format based on the LOCAL timezone,
 * unlike the native .toISOString() which always returns UTC timezone.
 */
export const getLocalISODate = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
