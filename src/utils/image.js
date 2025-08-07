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
 * @param {{ data: Array<{ id: string, name: string }>, selectedRowKeys: Array<string> }} project
 * @returns {string} The name of the selected project.
 * @example
 * const project = {
 *   data: [
 *     { id: '1', name: 'Project Alpha' },
 *     { id: '2', name: 'Project Beta' }
 *   ],
 *   selectedRowKeys: ['2']
 * };
 * getSelectedProjectName(project); // Returns 'Project Beta'
 */
export const getSelectedProjectName = (project) => {
  const selectedProject = project.data.filter(
    (p) => p.id === project.selectedRowKeys[0]
  );
  return selectedProject[0].name;
};
