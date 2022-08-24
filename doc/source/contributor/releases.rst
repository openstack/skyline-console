Skyline Project Releases
========================

The Skyline project follows the OpenStack 6 month development cycle,
at the end of which a new stable branch is created from master, and master
becomes the development branch for the next development cycle.

Because many OpenStack consumers don't move as quickly as OpenStack
development, we backport appropriate bugfixes from master into the stable
branches and create new releases for consumers to use ... for a while.
See the `Stable Branches
<https://docs.openstack.org/project-team-guide/stable-branches.html>`_
section of the
`OpenStack Project Team Guide
<https://docs.openstack.org/project-team-guide/index.html>`_
for details about the timelines.

What follows is information about the Skyline project and its releases.

Where Stuff Is
~~~~~~~~~~~~~~

The Skyline Project Deliverables
--------------------------------

https://governance.openstack.org/tc/reference/projects/skyline.html#deliverables

The Code Repositories
---------------------

* https://opendev.org/openstack/skyline-apiserver
* https://opendev.org/openstack/skyline-console

All Skyline Project Releases
----------------------------

https://releases.openstack.org/teams/skyline.html

How Stuff Works
~~~~~~~~~~~~~~~

Releases from Master
--------------------

Releases from **master** for *skyline-console* follow the 'cycle-with-rc'
release model.

* The 'cycle-with-rc' model describes projects that produce a single release
  at the end of the cycle, with one or more release candidates (RC) close to
  the end of the cycle and optional development milestone betas published on
  a per-project need.

For more information about the release models and deliverable types:
https://releases.openstack.org/reference/release_models.html

Branching
---------

All Skyline project deliverables follow the `OpenStack stable branch policy
<https://docs.openstack.org/project-team-guide/stable-branches.html>`_. Briefly,

* The stable branches are intended to be a safe source of fixes for high
  impact bugs and security issues which have been fixed on master since a
  given release.
* Stable branches are cut from the last release of a given deliverable, at
  the end of the common 6-month development cycle.

While anyone may propose a release, releases must be approved by
the `OpenStack Release Managers
<https://review.opendev.org/admin/groups/5c75219bf2ace95cdea009c82df26ca199e04d59,members>`_.
