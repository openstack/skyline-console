import centosIcon from 'asset/image/centos.svg';
import ubuntuIcon from 'asset/image/ubuntu.svg';
import fedoraIcon from 'asset/image/fedora.svg';
import windowsIcon from 'asset/image/windows.svg';
import debianIcon from 'asset/image/debian.svg';
import coreosIcon from 'asset/image/coreos.svg';
import archIcon from 'asset/image/arch.svg';
import freebsdIcon from 'asset/image/freebsd.svg';
import othersIcon from 'asset/image/others.svg';

export const osTitleMap = {
  centos: 'CentOS',
  ubuntu: 'Ubuntu',
  fedora: 'Fedora',
  windows: 'Windows',
  debian: 'Debian',
  coreos: 'CoreOS',
  arch: 'Arch',
  freebsd: 'FreeBSD',
  // The following two are for compatibility
  other: 'Others',
  others: 'Others',
};

export const osIconMap = {
  centos: centosIcon,
  ubuntu: ubuntuIcon,
  fedora: fedoraIcon,
  windows: windowsIcon,
  debian: debianIcon,
  coreos: coreosIcon,
  arch: archIcon,
  freebsd: freebsdIcon,
  // The following two are for compatibility
  other: othersIcon,
  others: othersIcon,
};
