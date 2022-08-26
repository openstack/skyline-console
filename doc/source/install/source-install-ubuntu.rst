.. _source-install-ubuntu:

Source Install Ubuntu
~~~~~~~~~~~~~~~~~~~~~

This section describes how to install and configure the Skyline Console
service. Before you begin, you must have a ready OpenStack environment. At
least it includes ``keystone, glance, nova, neutron and skyline-apiserver service``.

Prerequisites
-------------



Install and configure components
--------------------------------

We will install the Skyline Console service from source code.

#. Git clone the repository from OpenDev (GitHub)

   .. code-block:: console

      $ sudo apt update
      $ sudo apt install -y git
      $ cd ${HOME}
      $ git clone https://opendev.org/openstack/skyline-console.git

   .. note::

      If you meet the following error, you need to run command ``sudo apt install -y ca-certificates``:

      `fatal: unable to access 'https://opendev.org/openstack/skyline-sonsole.git/': server
      certificate verification failed. CAfile: none CRLfile: none`

Finalize installation
---------------------
