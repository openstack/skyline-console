import globalProjectStore from 'stores/keystone/project';
import { isEmpty } from 'lodash';
import globalShareStore from 'src/stores/manila/share';

export const shareStatus = {
  creating: t('Creating'),
  creating_from_snapshot: t('Creating From Snapshot'),
  deleting: t('Deleting'),
  deleted: t('Deleted'),
  error: t('Error'),
  error_deleting: t('Error Deleting'),
  available: t('Available'),
  inactive: t('Inactive'),
  manage_starting: t('Manage Starting'),
  manage_error: t('Manage Error'),
  unmanage_starting: t('Unmanage Starting'),
  unmanage_error: t('Unmanage Error'),
  unmanaged: t('Unmanaged'),
  extending: t('Extending'),
  extending_error: t('Extending Error'),
  shrinking: t('Shrinking'),
  shrinking_error: t('Shrinking Error'),
  shrinking_possible_data_loss_error: t('Shrinking Possible Data Loss Error'),
  migrating: t('Migrating'),
  migrating_to: t('Migrating To'),
  replication_change: t('Replication Change'),
  reverting: t('Reverting'),
  reverting_error: t('Reverting Error'),
};

export const accessRuleStatus = {
  active: t('Active'),
  error: t('Error'),
  syncing: t('Syncing'),
};

export const replicaState = {
  active: t('Active'),
  error: t('Error'),
  in_sync: t('Syncing'),
  out_of_sync: t('Out of Sync'),
};

/**
 * Currently, only NFS and CIFS are supported as share protocol options.
 * Other options have been commented out rather than removed entirely,
 * in case support for them is reinstated in the future.
 */
export const shareProtocol = {
  NFS: t('NFS'),
  CIFS: t('CIFS'),
  // GlusterFS: t('GlusterFS'),
  // HDFS: t('HDFS'),
  // CephFS: t('CephFS'),
  // MAPRFS: t('MAPRFS'),
};

export const shareVisibility = {
  public: t('Public'),
  private: t('Private'),
};

export const shareAccessRuleState = {
  new: t('New'),
  active: t('Active'),
  error: t('Error'),
  queued_to_apply: t('Queued To Apply'),
  queued_to_deny: t('Queued To Deny'),
  denying: t('Denying'),
  applying: t('Applying'),
};

export const shareAccessLevel = {
  rw: t('Read and write'),
  ro: t('Read only'),
};

export const shareAccessType = {
  ip: t('IP'),
  cert: t('Cert'),
  user: t('User'),
  cephx: t('Cephx'),
};

// deal with quota
export function setCreateShareSize(value) {
  globalShareStore.setCreateShareSize(value);
}

export async function fetchShareQuota(self) {
  self.setState({
    quota: {},
    quotaLoading: true,
  });
  const result = await globalProjectStore.fetchProjectShareQuota();
  self.setState({
    quota: result,
    quotaLoading: false,
  });
}

export const getQuota = (shareQuota, quotaKeys = ['shares', 'gigabytes']) => {
  if (isEmpty(shareQuota)) {
    return {};
  }
  return quotaKeys.reduce((pre, cur) => {
    pre[cur] = shareQuota[cur] || {};
    return pre;
  }, {});
};

export const getAdd = (
  shareQuota,
  quotaKeys = ['shares', 'gigabytes'],
  wishes = [1, 1]
) => {
  if (isEmpty(shareQuota)) {
    return [];
  }
  const info = getQuota(shareQuota, quotaKeys);
  let hasError = false;
  quotaKeys.forEach((key, index) => {
    if (!hasError) {
      const quotaDetail = info[key];
      const { left = 0 } = quotaDetail || {};
      const wish = wishes[index];
      if (left !== -1 && left < wish) {
        hasError = true;
      }
    }
  });
  if (!hasError) {
    return wishes;
  }
  return new Array(quotaKeys.length).fill(0);
};

const titleMap = {
  shares: t('Share'),
  gigabytes: t('Share Capacity (GiB)'),
  share_networks: t('Share Network'),
  share_groups: t('Share Group'),
};

export const getQuotaInfo = (
  self,
  quotaKeys = ['shares', 'gigabytes'],
  wishes = [1, 1]
) => {
  const { quota = {}, quotaLoading } = self.state;
  if (quotaLoading || isEmpty(quota)) {
    return [];
  }
  const adds = getAdd(quota, quotaKeys, wishes);
  const infos = getQuota(quota, quotaKeys);
  return quotaKeys.map((key, index) => {
    const type = index === 0 ? 'ring' : 'line';
    const title = titleMap[key];
    const info = infos[key] || {};
    return {
      ...info,
      add: adds[index],
      name: key,
      title,
      type,
    };
  });
};

export const checkQuotaDisable = (quotaKeys, wishes) => {
  const { shareQuota = {} } = globalProjectStore;
  const adds = getAdd(shareQuota, quotaKeys, wishes);
  return adds[0] === 0;
};

export const onShareSizeChange = (value) => {
  setCreateShareSize(value);
};

export const getShareSizeInStore = () => {
  return globalShareStore.shareSizeForCreate;
};
