export const yesNoOptions = [
  { label: t('Yes'), key: true, value: true },
  { label: t('No'), key: false, value: false },
];

export const shareTypeColumns = [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    routeName: 'shareTypeDetailAdmin',
  },
  {
    title: t('Description'),
    dataIndex: 'description',
    isHideable: true,
    valueRender: 'noValue',
  },
  {
    title: t('Public'),
    dataIndex: 'share_type_access:is_public',
    valueRender: 'yesNo',
  },
];

export const shareTypeFilters = [
  {
    name: 'name',
    label: t('Name'),
  },
];

export const checkShareTypeSupportServer = (item) => {
  const { extra_specs = {} } = item;
  const { driver_handles_share_servers: driver } = extra_specs;
  return driver === 'True' || driver === 'true' || driver === true;
};

export const shareTypeTip = t(
  'Note that when using a share type with the driver_handles_share_servers extra spec as False, you should not provide a share network.'
);
