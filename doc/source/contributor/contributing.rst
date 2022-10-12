============================
So You Want to Contribute...
============================

For general information on contributing to OpenStack, please check out the
`contributor guide <https://docs.openstack.org/contributors/>`_ to get started.
It covers all the basics that are common to all OpenStack projects: the
accounts you need, the basics of interacting with our Gerrit review system, how
we communicate as a community, etc.

Below will cover the more project specific information you need to get started
with the skyline-console project, which is responsible for the following
OpenStack deliverables:

skyline-console
    | The OpenStack Modern Dashboard - front-end.
    | code: https://opendev.org/openstack/skyline-console
    | docs: https://docs.openstack.org/skyline-console/latest/
    | Launchpad: https://launchpad.net/skyline-console

Communication
~~~~~~~~~~~~~

IRC
    We use IRC *a lot*.  You will, too.  You can find infomation about what
    IRC network OpenStack uses for communication (and tips for using IRC)
    in the `Setup IRC
    <https://docs.openstack.org/contributors/common/irc.html>`_
    section of the main `OpenStack Contributor Guide`.

    People working on the Skyline Console project may be found in the
    ``#openstack-skyline`` IRC channel during working hours
    in their timezone.  The channel is logged, so if you ask a question
    when no one is around, you can check the log to see if it's been
    answered: http://eavesdrop.openstack.org/irclogs/%23openstack-skyline/

weekly meeting
    .. note::

      Now we have not weekly meeting, we will have it in the future.

mailing list
    We use the openstack-discuss@lists.openstack.org mailing list for
    asynchronous discussions or to communicate with other OpenStack teams.
    Use the prefix ``[skyline]`` in your subject line (it's a high-volume
    list, so most people use email filters).

    More information about the mailing list, including how to subscribe
    and read the archives, can be found at:
    http://lists.openstack.org/cgi-bin/mailman/listinfo/openstack-discuss

Contacting the Core Team
~~~~~~~~~~~~~~~~~~~~~~~~

The skyline-core team is an active group of contributors who are responsible
for directing and maintaining the skyline-console project. As a new
contributor, your interaction with this group will be mostly through code
reviews, because only members of skyline-core can approve a code change to be
merged into the code repository.

You can learn more about the role of core reviewers in the OpenStack
governance documentation:
https://docs.openstack.org/contributors/common/governance.html#core-reviewer

The membership list of skyline-core is maintained in gerrit:
https://review.opendev.org/admin/groups/1fe65032c39f1d459327b010730627a904d7b793,members

Project Team Lead
~~~~~~~~~~~~~~~~~

For each development cycle, Skyline Console project Active Technical
Contributors (ATCs) elect a Project Team Lead who is responsible for running
midcycles, and skyline-console sessions at the Project Team Gathering for
that cycle (and who is also ultimately responsible for everything else the
project does).

* You automatically become an ATC by making a commit to one of the
  skyline-console deliverables. Other people who haven't made a commit,
  but have contributed to the project in other ways (for example, making good
  bug reports) may be recognized as "extra-ATCs" and obtain voting privileges.
  If you are such a person, contact the current PTL before the "Extra-ATC
  freeze" indicated on the current development cycle schedule (which you can
  find from the `OpenStack Releases homepage
  <https://releases.openstack.org/index.html>`_ .

The current Skyline Console project Project Team Lead (PTL) is listed in the
`Skyline Console project reference
<https://governance.openstack.org/tc/reference/projects/skyline.html>`_
maintained by the OpenStack Technical Committee.

All common PTL duties are enumerated in the `PTL guide
<https://docs.openstack.org/project-team-guide/ptl.html>`_.

New Feature Planning
~~~~~~~~~~~~~~~~~~~~

The Skyline Console project uses "blueprints" to track new features. Here's a
quick rundown of what they are and how the Skyline Console project uses them.

blueprints
    | Exist in Launchpad, where they can be targeted to release milestones.
    | You file one at https://blueprints.launchpad.net/skyline-console

Feel free to ask in ``#openstack-skyline`` if you have an idea you want to
develop and you're not sure whether it requires a blueprint *and* a spec or
simply a blueprint.

The Skyline Console project observes the following deadlines. For the current
development cycle, the dates of each (and a more detailed description)
may be found on the release schedule, which you can find from:
https://releases.openstack.org/

* bp freeze (all bps must be approved by this date)
* new feature status checkpoint

Task Tracking
~~~~~~~~~~~~~

We track our tasks in Launchpad. See the top of the page for the URL of
Skyline Console project deliverable.

If you're looking for some smaller, easier work item to pick up and get started
on, search for the 'low-hanging-fruit' tag in the Bugs section.

When you start working on a bug, make sure you assign it to yourself.
Otherwise someone else may also start working on it, and we don't want to
duplicate efforts.  Also, if you find a bug in the code and want to post a
fix, make sure you file a bug (and assign it to yourself!) just in case someone
else comes across the problem in the meantime.

Reporting a Bug
~~~~~~~~~~~~~~~

You found an issue and want to make sure we are aware of it? You can do so in
the Launchpad space for the affected deliverable:

* skyline-console: https://bugs.launchpad.net/skyline-console

Getting Your Patch Merged
~~~~~~~~~~~~~~~~~~~~~~~~~

Before your patch can be merged, it must be *reviewed* and *approved*.

The Skyline Console project policy is that a patch must have two +2s before
it can be merged. (Exceptions are documentation changes, which require only a
single +2, for which the PTL may require more than two +2s, depending on the
complexity of the proposal.)  Only members of the skyline-core team can vote +2
(or -2) on a patch, or approve it.

.. note::

   Although your contribution will require reviews by members of
   skyline-core, these aren't the only people whose reviews matter.
   Anyone with a gerrit account can post reviews, so you can ask
   other developers you know to review your code ... and you can
   review theirs. (A good way to learn your way around the codebase
   is to review other people's patches.)

   If you're thinking, "I'm new at this, how can I possibly provide
   a helpful review?", take a look at `How to Review Changes the
   OpenStack Way
   <https://docs.openstack.org/project-team-guide/review-the-openstack-way.html>`_.

   There are also some Skyline Console project specific reviewing
   guidelines in the :ref:`reviewing-skyline-console` section of the
   Skyline Console Contributor Guide.

In addition, some changes may require a release note. Any patch that
changes functionality, adds functionality, or addresses a significant
bug should have a release note.  You can find more information about
how to write a release note in the :ref:`release-notes` section of the
Skyline Console Contributors Guide.

.. note::

   Keep in mind that the best way to make sure your patches are reviewed in
   a timely manner is to review other people's patches. We're engaged in a
   cooperative enterprise here.

If your patch has a -1 from Zuul, you should fix it right away, because
people are unlikely to review a patch that is failing the CI system.

How long it may take for your review to get attention will depend on the
current project priorities. For example, the feature freeze is at the
third milestone of each development cycle, so feature patches have the
highest priority just before M-3. These dates are clearly noted on the
release schedule for the current release, which you can find
from https://releases.openstack.org/

You can see who's been doing what with Skyline Console recently in
Stackalytics:
https://www.stackalytics.io/report/activity?module=skyline-group
